import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';

/**
 * Service to fetch gigs with filtering, sorting, and pagination.
 */
export const fetchGigs = async (filters, options) => {
    const { page = 1, limit = 12 } = options;
    const skip = (page - 1) * limit;

    let query = { status: 'open' };
    let sort = { createdAt: -1 };

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

    if (options.sortBy) {
        const parts = options.sortBy.split(':');
        const field = parts[0];
        const order = parts[1] === 'desc' ? -1 : 1;
        sort = { [field]: order };
    }

    const [gigs, total] = await Promise.all([
        Gig.find(query)
            .populate('ownerId', 'name email avatar rating')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Gig.countDocuments(query)
    ]);

    return {
        gigs,
        total,
        page,
        totalPages: Math.ceil(total / limit)
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
        const error = new Error('Gig not found');
        error.status = 404;
        throw error;
    }

    if (gig.ownerId.toString() !== userId.toString()) {
        const error = new Error('Not authorized to delete this gig');
        error.status = 401;
        throw error;
    }

    if (gig.status !== 'open') {
        const error = new Error('Cannot delete gig once it is assigned or closed');
        error.status = 400;
        throw error;
    }

    await Bid.deleteMany({ gigId: gig._id });
    await gig.deleteOne();
    return true;
};

/**
 * Service to transition gig status.
 */
export const transitionStatus = async (id, userId, newStatus) => {
    const gig = await Gig.findById(id);

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

    // Logic for transitions
    if (newStatus === 'in-progress' && gig.status !== 'assigned') {
        throw new Error('Gig must be assigned before starting');
    }
    if (newStatus === 'completed' && gig.status !== 'in-progress') {
        throw new Error('Gig must be in-progress before completing');
    }
    if (newStatus === 'closed' && gig.status !== 'completed') {
        throw new Error('Gig must be completed before closing');
    }

    gig.status = newStatus;
    return await gig.save();
};
