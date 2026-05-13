import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';

/**
 * Service to create a new bid.
 */
export const createBid = async (bidData) => {
    const { gigId, freelancerId } = bidData;

    // Check if the gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'open') {
        const error = new Error('Gig is not available for bidding');
        error.status = 400;
        throw error;
    }

    // Check if user already bid
    const existingBid = await Bid.findOne({ gigId, freelancerId });
    if (existingBid) {
        const error = new Error('You have already placed a bid on this gig');
        error.status = 400;
        throw error;
    }

    const bid = new Bid(bidData);
    return await bid.save();
};

/**
 * Service to update a bid.
 */
export const updateBid = async (id, userId, updateData) => {
    const bid = await Bid.findById(id);

    if (!bid) {
        const error = new Error('Bid not found');
        error.status = 404;
        throw error;
    }

    if (bid.freelancerId.toString() !== userId.toString()) {
        const error = new Error('Not authorized to update this bid');
        error.status = 401;
        throw error;
    }

    if (bid.status !== 'pending') {
        const error = new Error('Cannot update bid after it has been processed');
        error.status = 400;
        throw error;
    }

    bid.message = updateData.message || bid.message;
    bid.price = updateData.price || bid.price;

    return await bid.save();
};

/**
 * Service to withdraw a bid.
 */
export const withdrawBid = async (id, userId) => {
    const bid = await Bid.findById(id);

    if (!bid) {
        const error = new Error('Bid not found');
        error.status = 404;
        throw error;
    }

    if (bid.freelancerId.toString() !== userId.toString()) {
        const error = new Error('Not authorized to withdraw this bid');
        error.status = 401;
        throw error;
    }

    bid.status = 'withdrawn';
    return await bid.save();
};

/**
 * Service to accept a bid.
 */
export const acceptBid = async (id, ownerId) => {
    const bid = await Bid.findById(id).populate('gigId');

    if (!bid) {
        const error = new Error('Bid not found');
        error.status = 404;
        throw error;
    }

    if (bid.gigId.ownerId.toString() !== ownerId.toString()) {
        const error = new Error('Not authorized to accept bids for this gig');
        error.status = 401;
        throw error;
    }

    if (bid.gigId.status !== 'open') {
        const error = new Error('Gig is no longer open for hiring');
        error.status = 400;
        throw error;
    }

    // Update bid status
    bid.status = 'hired';
    await bid.save();

    // Update gig status and set escrow
    const gig = bid.gigId;
    gig.status = 'assigned';
    gig.escrowAmount = bid.price;
    await gig.save();

    // Reject other bids
    await Bid.updateMany(
        { gigId: gig._id, _id: { $ne: bid._id }, status: 'pending' },
        { status: 'rejected' }
    );

    return bid;
};
