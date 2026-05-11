import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Gig from '../models/Gig.js'; // Import Gig model
import Bid from '../models/Bid.js'; // Import Bid model
import logger from '../config/logger.js'; // Import Winston logger

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;
        user.skills = req.body.skills || user.skills;
        user.profilePic = req.body.profilePic || user.profilePic;
        // role and balance should ideally not be updatable by user profile endpoint
        // user.role = req.body.role || user.role; 
        // user.balance = req.body.balance || user.balance;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            bio: updatedUser.bio,
            skills: updatedUser.skills,
            profilePic: updatedUser.profilePic,
            role: updatedUser.role, // Include role
            averageRating: updatedUser.averageRating, // Include rating
            completedGigsCount: updatedUser.completedGigsCount // Include completed gigs count
        });
        logger.info(`User profile updated: ${updatedUser._id}`);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get gigs posted by a user
// @route   GET /api/users/:id/gigs
// @access  Public
const getUserGigs = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const gigs = await Gig.find({ ownerId: userId }).sort({ createdAt: -1 }); // Fetch all gigs by this user
    res.json(gigs);
    logger.info(`Fetched gigs for user: ${userId}`);
});

// @desc    Get bids submitted by a user
// @route   GET /api/users/:id/bids
// @access  Public (Potentially Private for others, depends on requirements)
const getUserBids = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    // Fetch bids where freelancerId matches the userId
    const bids = await Bid.find({ freelancerId: userId })
        .populate('gigId', 'title budget status') // Populate basic gig info
        .sort({ createdAt: -1 });
    res.json(bids);
    logger.info(`Fetched bids for user: ${userId}`);
});


export { getUserById, updateUserProfile, getUserGigs, getUserBids };
