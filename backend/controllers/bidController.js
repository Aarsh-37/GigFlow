import asyncHandler from 'express-async-handler';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import createNotification from '../utils/notificationUtils.js';
import logger from '../config/logger.js'; // Import Winston logger
import { validationResult } from 'express-validator'; // Import validationResult

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

    if (gig.bidDeadline && new Date(gig.bidDeadline) < new Date()) {
        res.status(400);
        throw new Error('The bid deadline for this gig has passed');
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
        price,
    });

    await createNotification(req.io, {
        userId: gig.ownerId,
        message: `New bid placed on your gig: ${gig.title}`,
        type: 'bid_placed',
        link: `/gigs/${gig._id}`
    });

    // Refresh sender's dashboard too
    if (req.io) {
        req.io.to(gig.ownerId.toString()).emit('dashboard_update'); // Emit to gig owner's room
    }

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
        .populate('freelancerId', 'name email profilePic rating skills') // Populate more freelancer details
        .sort({ createdAt: -1 });

    res.json(bids);
});

// @desc    Hire a freelancer
// @route   PATCH /api/bids/:bidId/hire
// @access  Private (Owner only)
const hireFreelancer = asyncHandler(async (req, res) => {
    const bidId = req.params.bidId;

    try {
        // Find bid and gig
        const bid = await Bid.findById(bidId);
        if (!bid) throw new Error('Bid not found');

        const gig = await Gig.findById(bid.gigId);
        if (!gig) throw new Error('Gig not found');

        // Authentication and Authorization checks
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to hire for this gig');
        }
        if (gig.status !== 'open') {
            res.status(400);
            throw new Error('Gig is not open for hiring');
        }

        // Ensure freelancer is not the owner
        if (bid.freelancerId.toString() === req.user._id.toString()) {
             res.status(400);
             throw new Error('You cannot hire yourself');
        }

        // --- Core Hiring Logic ---

        // 1. Payment Simulation: Check balance and move funds to escrow
        const owner = await User.findById(req.user._id);
        if (!owner) throw new Error('Hiring user not found');
        if (owner.balance < bid.price) {
            res.status(400);
            throw new Error('Insufficient balance to hire for this gig');
        }
        owner.balance -= bid.price;
        await owner.save();

        // Update gig escrow amount
        gig.escrowAmount = bid.price;

        // 2. Update Gig status to 'assigned'
        gig.status = 'assigned';
        await gig.save();

        // 3. Update Chosen Bid status to 'hired'
        bid.status = 'hired';
        await bid.save();

        // 4. Reject all other bids for this gig
        await Bid.updateMany(
            { gigId: gig._id, _id: { $ne: bidId } },
            { status: 'rejected' }
        );

        // 5. Notify hired freelancer
        const notificationMessage = `Congratulations! You have been hired for the gig: "${gig.title}"`;
        await createNotification(req.io, {
            userId: bid.freelancerId,
            message: notificationMessage,
            type: 'hired',
            link: `/gigs/${gig._id}`
        });

        // 6. Refresh client's dashboard (emit to client's room)
        if (req.io) {
            req.io.to(req.user._id.toString()).emit('dashboard_update');
        }

        res.json({ message: 'Freelancer hired successfully', gig, bid });

    } catch (error) {
        logger.error('Hiring error:', error); // Use logger.error
        // Avoid overriding existing status codes if set by earlier checks
        if (res.statusCode === 200) res.status(500);
        throw error; // Re-throw to be caught by global errorHandler
    }
});

// @desc    Update a bid (Freelancer)
// @route   PATCH /api/bids/:id
// @access  Private (Bidder only)
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
    if (!gig) {
         res.status(404);
         throw new Error('Gig not found');
    }
    if (gig.status !== 'open') {
        res.status(400);
        throw new Error('Cannot update bid: Gig is no longer open');
    }

    bid.message = message !== undefined ? message : bid.message;
    bid.price = price !== undefined ? Number(price) : bid.price;

    // Recalculate validations if necessary (e.g., price positive)
    if (bid.price <= 0) {
        res.status(400);
        throw new Error('Price must be a positive number');
    }

    const updatedBid = await bid.save();
    logger.info(`Bid updated: ${updatedBid._id} by ${req.user._id}`);
    res.json(updatedBid);
});

// @desc    Withdraw a bid
// @route   DELETE /api/bids/:id
// @access  Private (Bidder only)
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
    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }
    if (gig.status !== 'open') {
        res.status(400);
        throw new Error('Cannot withdraw bid: Gig is no longer open');
    }

    // Notify gig owner about withdrawal
    await createNotification(req.io, {
        userId: gig.ownerId,
        message: `A freelancer has withdrawn their bid for gig: "${gig.title}".`,
        type: 'bid_withdrawn',
        link: `/gigs/${gig._id}`
    });
     if (req.io) {
        req.io.to(gig.ownerId.toString()).emit('dashboard_update'); // Emit to gig owner's room
    }

    await bid.deleteOne();
    logger.info(`Bid withdrawn: ${bid._id} by ${req.user._id}`);
    res.json({ message: 'Bid withdrawn successfully' });
});

export { placeBid, getBidsByGig, hireFreelancer, updateBid, withdrawBid };
