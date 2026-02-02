import asyncHandler from 'express-async-handler';
import Gig from '../models/Gig.js';
<<<<<<< HEAD
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import createNotification from '../utils/notificationUtils.js';
=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
const getGigs = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            title: {
                $regex: req.query.search,
                $options: 'i'
            }
        }
        : {};

    // Only show open gigs in the feed
    const gigs = await Gig.find({ ...keyword, status: 'open' })
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 });

    res.json(gigs);
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
<<<<<<< HEAD
    const { title, description, budget, bidDeadline } = req.body;
=======
    const { title, description, budget } = req.body;
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f

    const gig = new Gig({
        ownerId: req.user._id,
        title,
        description,
        budget,
<<<<<<< HEAD
        bidDeadline,
=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
        status: 'open'
    });

    const createdGig = await gig.save();
    res.status(201).json(createdGig);
});

<<<<<<< HEAD
// @desc    Start a gig (Owner only)
// @route   PATCH /api/gigs/:id/start
// @access  Private
const startGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (gig.status !== 'assigned') {
        res.status(400);
        throw new Error('Gig must be assigned before starting');
    }

    gig.status = 'in-progress';
    await gig.save();

    // Refresh actor's dashboard
    if (req.io) {
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    res.json(gig);
});

// @desc    Complete a gig (Owner/Client initiates)
// @route   PATCH /api/gigs/:id/complete
// @access  Private
const completeGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (gig.status !== 'in-progress') {
        res.status(400);
        throw new Error('Gig must be in-progress before completing');
    }

    gig.status = 'completed';
    await gig.save();

    // Refresh actor's dashboard
    if (req.io) {
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    res.json(gig);
});

// @desc    Close a gig (Final step)
// @route   PATCH /api/gigs/:id/close
// @access  Private
const closeGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (gig.status !== 'completed') {
        res.status(400);
        throw new Error('Gig must be completed before closing');
    }

    gig.status = 'closed';
    await gig.save();

    // Increment completedGigsCount for freelancer
    const chosenBid = await Bid.findOne({ gigId: gig._id, status: 'hired' });
    if (chosenBid) {
        await User.findByIdAndUpdate(chosenBid.freelancerId, {
            $inc: {
                completedGigsCount: 1,
                balance: gig.escrowAmount
            }
        });

        const releasedAmount = gig.escrowAmount;
        gig.escrowAmount = 0;
        await gig.save();

        await createNotification(req.io, {
            userId: chosenBid.freelancerId,
            message: `The gig "${gig.title}" has been closed. ₹${releasedAmount} has been released to your balance!`,
            type: 'gig_closed',
            link: `/gigs/${gig._id}`
        });
    }

    // Refresh actor's dashboard (freelancer)
    if (req.io) {
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    res.json(gig);
});

export { getGigs, getGigById, createGig, startGig, completeGig, closeGig };
=======
export { getGigs, getGigById, createGig };
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
