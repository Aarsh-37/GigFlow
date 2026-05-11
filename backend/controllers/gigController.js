import asyncHandler from 'express-async-handler';
import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import createNotification from '../utils/notificationUtils.js';
import logger from '../config/logger.js'; // Import Winston logger

// @desc    Get all gigs with pagination and search
// @route   GET /api/gigs
// @access  Public
const getGigs = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 12; // Default limit to 12
    const page = Number(req.query.page) || 1; // Default page to 1
    const skip = (page - 1) * pageSize;

    const keyword = req.query.search
        ? {
            title: {
                $regex: req.query.search,
                $options: 'i'
            }
        }
        : {};

    try {
        const [gigs, total] = await Promise.all([
            Gig.find({ ...keyword, status: 'open' })
                .populate('ownerId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize),
            Gig.countDocuments({ ...keyword, status: 'open' })
        ]);

        const totalPages = Math.ceil(total / pageSize);

        res.json({
            gigs,
            page,
            limit: pageSize,
            totalPages,
            totalGigs: total
        });
        logger.info(`Fetched ${gigs.length} gigs for page ${page}`); // Log info
    } catch (error) {
        logger.error('Error fetching gigs:', error); // Log error
        res.status(500).json({ message: 'Server Error fetching gigs' });
    }
});

// @desc    Get gig by ID
// @route   GET /api/gigs/:id
// @access  Public (but sensitive info might depend on Auth, for now Public)
const getGigById = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name email');

    if (gig) {
        res.json(gig);
    } else {
        res.status(404);
        throw new Error('Gig not found');
    }
});

// @desc    Create a gig
// @route   POST /api/gigs
// @access  Private
const createGig = asyncHandler(async (req, res) => {
    const { title, description, budget, bidDeadline } = req.body;

    const gig = new Gig({
        ownerId: req.user._id,
        title,
        description,
        budget,
        bidDeadline,
        status: 'open'
    });

    const createdGig = await gig.save();
    logger.info(`Gig created: ${createdGig._id} by ${req.user._id}`); // Log info
    res.status(201).json(createdGig);
});

// @desc    Start a gig (Owner only)
// @route   PATCH /api/gigs/:id/start
// @access  Private
const startGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to perform this action');
    }

    if (gig.status !== 'assigned') {
        res.status(400);
        throw new Error('Gig must be assigned before starting');
    }

    gig.status = 'in-progress';
    await gig.save();

    // Notify freelancer
    if (req.io) {
        await createNotification(req.io, {
            userId: gig.ownerId, // Notify the owner who started it (or freelancer?)
            message: `Gig "${gig.title}" has started!`,
            type: 'gig_started',
            link: `/gigs/${gig._id}`
        });
        // Refresh actor's dashboard
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    res.json(gig);
});

// @desc    Complete a gig (Owner/Client initiates)
// @route   PATCH /api/gigs/:id/complete
// @access  Private
const completeGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to perform this action');
    }

    if (gig.status !== 'in-progress') {
        res.status(400);
        throw new Error('Gig must be in-progress before completing');
    }

    gig.status = 'completed';
    await gig.save();

    // Notify freelancer
    if (req.io) {
        const chosenBid = await Bid.findOne({ gigId: gig._id, status: 'hired' });
        if (chosenBid) {
             await createNotification(req.io, {
                userId: chosenBid.freelancerId,
                message: `The gig "${gig.title}" has been marked as completed by the client.`,
                type: 'gig_completed',
                link: `/gigs/${gig._id}`
            });
            // Refresh freelancer's dashboard
            req.io.to(chosenBid.freelancerId.toString()).emit('dashboard_update');
        }
        // Refresh actor's dashboard (client)
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    res.json(gig);
});

// @desc    Close a gig (Final step, payment release)
// @route   PATCH /api/gigs/:id/close
// @access  Private
const closeGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to perform this action');
    }

    if (gig.status !== 'completed') {
        res.status(400);
        throw new Error('Gig must be completed before closing');
    }

    const chosenBid = await Bid.findOne({ gigId: gig._id, status: 'hired' });
    if (!chosenBid) {
        // This case should ideally not happen if status is 'completed' but good to check
        logger.warn(`Gig ${gig._id} marked as closed but no hired bid found.`);
    }

    const releasedAmount = gig.escrowAmount; // Amount to be released
    gig.escrowAmount = 0; // Clear escrow
    gig.status = 'closed'; // Set final status
    await gig.save();

    if (chosenBid) {
        // Update freelancer balance and completed gigs count
        const freelancer = await User.findById(chosenBid.freelancerId);
        if (freelancer) {
            freelancer.balance += releasedAmount;
            freelancer.completedGigsCount += 1;
            await freelancer.save();

            await createNotification(req.io, {
                userId: chosenBid.freelancerId,
                message: `The gig "${gig.title}" has been closed. ₹${releasedAmount} has been released to your balance!`,
                type: 'gig_closed',
                link: `/gigs/${gig._id}`
            });
             // Refresh freelancer's dashboard
            if (req.io) {
                req.io.to(chosenBid.freelancerId.toString()).emit('dashboard_update');
            }
        } else {
            logger.warn(`Freelancer ${chosenBid.freelancerId} not found when closing gig ${gig._id}`);
        }
    }

    // Refresh client's dashboard
    if (req.io) {
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    logger.info(`Gig ${gig._id} closed and payment processed.`);
    res.json(gig);
});


export { getGigs, getGigById, createGig, startGig, completeGig, closeGig };
