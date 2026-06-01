import mongoose from 'mongoose';
import Gig from '../modules/shared/models/Gig.js';
import User from '../modules/shared/models/User.js';
import Application from '../modules/shared/models/Application.js';
import redis from '../modules/shared/config/redis.js';
import { GIG_STATUS } from '../modules/shared/utils/constants.js';

/**
 * Service to fetch gigs with filtering, sorting, and pagination (Cursor-based).
 */
export const fetchGigs = async (filters = {}) => {
    const limit = parseInt(filters.limit) || 12;
    const cursor = filters.cursor;

    let query = { status: GIG_STATUS.OPEN, isDeleted: { $ne: true } };
    let sort = { _id: -1 }; // Default to newest first using _id for stability

    if (cursor) {
        query._id = { $lt: cursor };
    }

    if (filters.search) {
        query.title = { $regex: filters.search, $options: 'i' };
    }
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.tags) {
        const tags = Array.isArray(filters.tags) ? filters.tags : filters.tags.split(',');
        query.tags = { $in: tags };
    }
    if (filters.ownerId) {
        query.ownerId = filters.ownerId;
    }
    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.sortBy) {
        const parts = filters.sortBy.split(':');
        const field = parts[0];
        const order = parts[1] === 'desc' ? -1 : 1;
        sort = { [field]: order, _id: -1 }; // Always include _id for tie-breaking
    }

    // Fetch one extra to determine if there's more data
    const gigs = await Gig.find(query)
        .populate('ownerId', 'name email avatar rating')
        .sort(sort)
        .limit(limit + 1)
        .lean();

    const hasMore = gigs.length > limit;
    if (hasMore) {
        gigs.pop();
    }

    const nextCursor = hasMore ? gigs[gigs.length - 1]._id : null;

    return {
        gigs,
        nextCursor,
        hasMore,
        limit
    };
};

/**
 * Service to fetch a single gig by ID.
 */
export const fetchGigById = async (id) => {
    const gig = await Gig.findById(id).populate('ownerId', 'name email avatar rating');
    if (!gig) {
        const error = new Error('Gig not found');
        error.status = 404;
        throw error;
    }
    return gig;
};

/**
 * Service to create a new gig.
 */
export const createGig = async (gigData) => {
    const gig = new Gig(gigData);
    return await gig.save();
};

/**
 * Service to update an existing gig.
 */
export const updateGig = async (id, userId, updateData) => {
    const gig = await Gig.findById(id);

    if (!gig) {
        const error = new Error('Gig not found');
        error.status = 404;
        throw error;
    }

    if (gig.ownerId.toString() !== userId.toString()) {
        const error = new Error('Not authorized to update this gig');
        error.status = 401;
        throw error;
    }

    if (gig.status !== 'open') {
        const error = new Error('Cannot update gig once it is assigned or closed');
        error.status = 400;
        throw error;
    }

    const allowedFields = ['title', 'description', 'budget', 'deadline', 'category', 'tags', 'attachments'];
    allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
            gig[field] = updateData[field];
        }
    });

    return await gig.save();
};

/**
 * Service to delete a gig.
 */
export const deleteGig = async (id, userId) => {
    const gig = await Gig.findById(id);

    if (!gig) {
        const error = new Error('Internship not found');
        error.status = 404;
        throw error;
    }

    if (gig.ownerId.toString() !== userId.toString()) {
        const error = new Error('Not authorized to delete this internship');
        error.status = 401;
        throw error;
    }

    if (gig.status !== 'open') {
        const error = new Error('Cannot delete internship once it is assigned or closed');
        error.status = 400;
        throw error;
    }

    await Application.deleteMany({ gigId: gig._id });
    await gig.deleteOne();
    return true;
};

/**
 * Service to transition gig status.
 *
 * NOTE: MongoDB transactions (sessions) require a replica set.
 * Since local dev typically runs a standalone MongoDB instance,
 * we use sequential awaits instead. The logic is identical.
 */
export const transitionStatus = async (id, userId, newStatus) => {
    let gig = await Gig.findById(id);

    if (!gig) {
        const error = new Error('Gig not found');
        error.status = 404;
        throw error;
    }

    if (gig.ownerId.toString() !== userId.toString()) {
        const error = new Error('Not authorized to perform this action');
        error.status = 401;
        throw error;
    }

    const currentStatus = gig.status;

    // Logic for transitions
    if (newStatus === GIG_STATUS.IN_PROGRESS && currentStatus !== GIG_STATUS.ASSIGNED) {
        throw new Error('Gig must be assigned before starting');
    }
    if (newStatus === GIG_STATUS.COMPLETED && currentStatus !== GIG_STATUS.IN_PROGRESS) {
        throw new Error('Gig must be in-progress before completing');
    }

    if (newStatus === GIG_STATUS.CLOSED) {
        if (currentStatus !== GIG_STATUS.COMPLETED) {
            throw new Error('Gig must be completed before closing');
        }

        // Idempotency check for stipend release
        if (redis) {
            const lockKey = `stipend:release:${gig._id}`;
            const acquired = await redis.set(lockKey, 'locked', 'NX', 'EX', 60);
            if (!acquired) {
                throw new Error('Stipend release already in progress or completed');
            }
        }

        const hiredApp = await Application.findOne({ gigId: gig._id, status: 'HIRED' });
        if (hiredApp) {
            const intern = await User.findById(hiredApp.internId);
            const hirer = await User.findById(gig.ownerId);

            const releaseAmount = gig.escrowAmount;

            // Release funds: Deduct from hirer's escrow, add to intern's balance
            hirer.escrowBalance -= releaseAmount;
            intern.balance += releaseAmount;
            intern.totalGigs += 1;

            await hirer.save();
            await intern.save();

            gig.escrowAmount = 0;
        }
    }

    // Optimistic lock check using findOneAndUpdate with current status and version
    const updatedGig = await Gig.findOneAndUpdate(
        { _id: id, status: currentStatus, __v: gig.__v },
        { $set: { status: newStatus, escrowAmount: gig.escrowAmount }, $inc: { __v: 1 } },
        { new: true }
    );

    if (!updatedGig) {
        throw new Error('Concurrent modification detected, please retry');
    }

    gig = updatedGig;

    return gig;
};
