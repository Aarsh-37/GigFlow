import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
<<<<<<< HEAD
import createNotification from '../utils/notificationUtils.js';
=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f

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

<<<<<<< HEAD
    if (gig.bidDeadline && new Date(gig.bidDeadline) < new Date()) {
        res.status(400);
        throw new Error('The bid deadline for this gig has passed');
    }

=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
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

<<<<<<< HEAD
    await createNotification(req.io, {
        userId: gig.ownerId,
        message: `New bid placed on your gig: ${gig.title}`,
        type: 'bid_placed',
        link: `/gigs/${gig._id}`
    });

    // Refresh sender's dashboard too
    if (req.io) {
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
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

    // Simplified without transaction for standalone MongoDB
    try {
        const bid = await Bid.findById(bidId);

        if (!bid) {
            throw new Error('Bid not found');
        }

        const gig = await Gig.findById(bid.gigId);

        if (!gig) {
            throw new Error('Gig not found');
        }

        // Auth check
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to hire for this gig');
        }

        if (gig.status !== 'open') {
            res.status(400);
            throw new Error('Gig is already assigned or closed');
        }

<<<<<<< HEAD
        // 0. Payment Simulation: Check and Move Funds to Escrow
        const owner = await User.findById(req.user._id);
        if (owner.balance < bid.price) {
            res.status(400);
            throw new Error('Insufficient balance to hire for this gig');
        }

        owner.balance -= bid.price;
        await owner.save();

        gig.escrowAmount = bid.price;

=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
        // 1. Update Gig status
        gig.status = 'assigned';
        await gig.save();

        // 2. Update Chosen Bid status
        bid.status = 'hired';
        await bid.save();

        // 3. Reject all other bids for this gig
        await Bid.updateMany(
            { gigId: gig._id, _id: { $ne: bidId } },
            { status: 'rejected' }
        );

        const message = `You have been hired for the gig: ${gig.title}!`;

<<<<<<< HEAD
        await createNotification(req.io, {
            userId: bid.freelancerId,
            message,
            type: 'hired',
            link: `/gigs/${gig._id}`
        });

        // Also refresh the actor's (client's) dashboard
        if (req.io) {
            req.io.to(req.user._id.toString()).emit('dashboard_update');
        }

=======
        req.io.to(bid.freelancerId.toString()).emit('notification', {
            message: message
        });

>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
        res.json({ message: 'Freelancer hired successfully', gig, bid });

    } catch (error) {
        console.error('Hiring error:', error);
        if (res.statusCode === 200) res.status(500);
        throw error;
    }
});

<<<<<<< HEAD
// @desc    Update a bid
// @route   PATCH /api/bids/:id
// @access  Private (Owner only)
const updateBid = asyncHandler(async (req, res) => {
    const { message, price } = req.body;
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
        res.status(404);
        throw new Error('Bid not found');
    }

    if (bid.freelancerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this bid');
    }

    const gig = await Gig.findById(bid.gigId);
    if (gig.status !== 'open') {
        res.status(400);
        throw new Error('Cannot update bid: Gig is no longer open');
    }

    bid.message = message || bid.message;
    bid.price = price || bid.price;

    const updatedBid = await bid.save();
    res.json(updatedBid);
});

// @desc    Withdraw a bid
// @route   DELETE /api/bids/:id
// @access  Private (Owner only)
const withdrawBid = asyncHandler(async (req, res) => {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
        res.status(404);
        throw new Error('Bid not found');
    }

    if (bid.freelancerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to withdraw this bid');
    }

    const gig = await Gig.findById(bid.gigId);
    if (gig.status !== 'open') {
        res.status(400);
        throw new Error('Cannot withdraw bid: Gig is no longer open');
    }

    await bid.deleteOne();
    res.json({ message: 'Bid withdrawn successfully' });
});

export { placeBid, getBidsByGig, hireFreelancer, updateBid, withdrawBid };
=======
export { placeBid, getBidsByGig, hireFreelancer };
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
