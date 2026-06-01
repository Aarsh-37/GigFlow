import mongoose from 'mongoose';
import Application from '../../shared/models/Application.js';
import Gig from '../../shared/models/Gig.js';
import User from '../../shared/models/User.js';
import { APPLICATION_STATUS, GIG_STATUS } from '../../shared/utils/constants.js';

/**
 * Service to create a new application.
 */
export const createApplication = async (applicationData) => {
    const { gigId, internId } = applicationData;

    // Check if the gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== GIG_STATUS.OPEN) {
        const error = new Error('Gig is not available for applications');
        error.statusCode = 400;
        throw error;
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({ gigId, internId });
    if (existingApplication) {
        const error = new Error('You have already applied for this gig');
        error.statusCode = 400;
        throw error;
    }

    const application = new Application(applicationData);
    return await application.save();
};

/**
 * Service to update application status (Hire/Reject).
 *
 * NOTE: MongoDB transactions (sessions) require a replica set.
 * Since local dev typically runs a standalone MongoDB instance,
 * we use sequential awaits instead. The logic is identical.
 */
export const updateApplicationStatus = async (applicationId, hirerId, status) => {
    // 1. Load and validate the application
    const application = await Application.findById(applicationId).populate('gigId');

    if (!application) {
        const error = new Error('Application not found');
        error.statusCode = 404;
        throw error;
    }

    // 2. Authorization: only the gig owner can update status
    if (application.gigId.ownerId.toString() !== hirerId.toString()) {
        const error = new Error('Not authorized to manage applications for this gig');
        error.statusCode = 403;
        throw error;
    }

    // 3. Validate the status value
    if (!Object.values(APPLICATION_STATUS).includes(status)) {
        const error = new Error('Invalid status update');
        error.statusCode = 400;
        throw error;
    }

    // 4. Update the application status
    application.status = status;
    await application.save();

    // 5. If hiring an intern, perform all related updates
    if (status === APPLICATION_STATUS.HIRED) {
        const gig = await Gig.findById(application.gigId._id);
        const hirer = await User.findById(hirerId);

        // Balance check
        if (hirer.balance < gig.budget) {
            // Rollback the status change
            application.status = APPLICATION_STATUS.APPLIED;
            await application.save();
            const error = new Error('Insufficient balance to hire for this internship');
            error.statusCode = 400;
            throw error;
        }

        // Deduct from hirer balance and move to escrow
        hirer.balance -= gig.budget;
        hirer.escrowBalance += gig.budget;
        await hirer.save();

        // Update gig to assigned state
        gig.status = GIG_STATUS.ASSIGNED;
        gig.hiredInternId = application.internId;
        gig.escrowAmount = gig.budget;
        await gig.save();

        // Reject all other pending applications for this gig
        await Application.updateMany(
            {
                gigId: gig._id,
                _id: { $ne: application._id },
                status: APPLICATION_STATUS.APPLIED,
            },
            { status: APPLICATION_STATUS.REJECTED }
        );
    }

    return application;
};

/**
 * Service to get applications for a specific gig (for Hirer)
 */
export const getApplicationsByGig = async (gigId, hirerId, filters = {}) => {
    const { limit = 10, cursor } = filters;
    const gig = await Gig.findById(gigId);

    if (!gig || gig.ownerId.toString() !== hirerId.toString()) {
        const error = new Error('Not authorized or gig not found');
        error.statusCode = 403;
        throw error;
    }

    const query = { gigId };
    if (cursor) {
        query._id = { $lt: cursor };
    }

    const applications = await Application.find(query)
        .populate('internId', 'name email avatar skills bio')
        .select('coverLetter status resume createdAt')
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = applications.length > limit;
    if (hasMore) applications.pop();

    const nextCursor = hasMore ? applications[applications.length - 1]._id : null;

    return {
        applications,
        nextCursor,
        hasMore
    };
};

export const getApplicationsByIntern = async (internId, filters = {}) => {
    const { limit = 10, cursor } = filters;

    const query = { internId };
    if (cursor) {
        query._id = { $lt: cursor };
    }

    const applications = await Application.find(query)
        .populate({
            path: 'gigId',
            select: 'title budget category status',
            populate: { path: 'ownerId', select: 'name email' }
        })
        .select('coverLetter status gigId createdAt')
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = applications.length > limit;
    if (hasMore) applications.pop();

    const nextCursor = hasMore ? applications[applications.length - 1]._id : null;

    return {
        applications,
        nextCursor,
        hasMore
    };
};
