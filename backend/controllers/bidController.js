import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';

// @desc    Place a bid
// @route   POST /api/bids
// @access  Private
const placeBid = asyncHandler(async (req, res) => {
    const { gigId, message, price } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.ownerId.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot bid on your own gig');
    }

    if (gig.status !== 'open') {
        res.status(400);
        throw new Error('This gig is no longer open');
    }

    const existingBid = await Bid.findOne({ gigId, freelancerId: req.user._id });
    if (existingBid) {
        res.status(400);
        throw new Error('You have already placed a bid on this gig');
    }

    const bid = await Bid.create({
        gigId,
        freelancerId: req.user._id,
        message,
        price
    });

    res.status(201).json(bid);
});

// @desc    Get bids for a gig
// @route   GET /api/bids/:gigId
// @access  Private (Owner only)
const getBidsByGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to view bids for this gig');
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
        .populate('freelancerId', 'name email')
        .sort({ createdAt: -1 });

    res.json(bids);
});

// @desc    Hire a freelancer (Atomic update)
// @route   PATCH /api/bids/:bidId/hire
// @access  Private (Owner only)
const hireFreelancer = asyncHandler(async (req, res) => {
    const bidId = req.params.bidId;

    // Start session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bid = await Bid.findById(bidId).session(session);

        if (!bid) {
            throw new Error('Bid not found');
        }

        const gig = await Gig.findById(bid.gigId).session(session);

        if (!gig) {
            throw new Error('Gig not found');
        }

        // Auth check: Only owner can hire
        // Note: req.user is set by protect middleware, not part of session, but valid
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to hire for this gig');
        }

        if (gig.status !== 'open') {
            res.status(400);
            throw new Error('Gig is already assigned or closed');
        }

        // 1. Update Gig status
        gig.status = 'assigned';
        await gig.save({ session });

        // 2. Update Chosen Bid status
        bid.status = 'hired';
        await bid.save({ session });

        // 3. Reject all other bids for this gig
        await Bid.updateMany(
            { gigId: gig._id, _id: { $ne: bidId } },
            { status: 'rejected' }
        ).session(session);

        await session.commitTransaction();

        // Bonus 2: Real-time notification
        req.io.to(bid.freelancerId.toString()).emit('notification', {
            message: `You have been hired for the gig: ${gig.title}!`
        });

        res.json({ message: 'Freelancer hired successfully', gig, bid });

    } catch (error) {
        await session.abortTransaction();
        console.error('Transaction aborted:', error);

        // Retain original error status if set, else 500 or 400
        if (res.statusCode === 200) res.status(500);
        throw error;
    } finally {
        session.endSession();
    }
});

export { placeBid, getBidsByGig, hireFreelancer };
