import asyncHandler from 'express-async-handler';
import Gig from '../models/Gig.js';

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
    const { title, description, budget } = req.body;

    const gig = new Gig({
        ownerId: req.user._id,
        title,
        description,
        budget,
        status: 'open'
    });

    const createdGig = await gig.save();
    res.status(201).json(createdGig);
});

export { getGigs, getGigById, createGig };
