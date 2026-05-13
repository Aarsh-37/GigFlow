import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendResponse from '../utils/sendResponse.js'; // Import the sendResponse utility
import logger from '../config/logger.js'; // Import logger

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // Set status before throwing error
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {
        generateToken(res, user._id);
        sendResponse(res, 201, true, 'User registered successfully', {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            balance: user.balance,
            profilePic: user.profilePic,
            completedGigsCount: user.completedGigsCount,
            averageRating: user.averageRating
        });
    } else {
        res.status(400); // Set status before throwing error
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        sendResponse(res, 200, true, 'User authenticated successfully', {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            balance: user.balance,
            profilePic: user.profilePic,
            completedGigsCount: user.completedGigsCount,
            averageRating: user.averageRating
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV !== 'development',
        sameSite: process.env.NODE_ENV === 'development' ? 'strict' : 'none'
    });
    sendResponse(res, 200, true, 'Logged out successfully');
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // Returning a subset of user data, excluding sensitive info like password hash
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        balance: req.user.balance,
        profilePic: req.user.profilePic,
        bio: req.user.bio, // Assuming bio exists in User model
        skills: req.user.skills, // Assuming skills exists
        linkedin: req.user.linkedin, // Assuming social links exist
        github: req.user.github,
        twitter: req.user.twitter,
        completedGigsCount: req.user.completedGigsCount,
        averageRating: req.user.averageRating
    };
    sendResponse(res, 200, true, 'User profile fetched successfully', user);
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Update fields that are present in the request body
        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;
        user.skills = req.body.skills || user.skills;
        user.profilePic = req.body.avatar || user.profilePic; // Use avatar from request body
        user.linkedin = req.body.linkedin || user.linkedin;
        user.github = req.body.github || user.github;
        user.twitter = req.body.twitter || user.twitter;

        const updatedUser = await user.save();
        logger.info(`User profile updated: ${updatedUser._id} by ${req.user._id}`);
        sendResponse(res, 200, true, 'Profile updated successfully', {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email, // Email should not be updatable directly via profile update
            role: updatedUser.role,
            balance: updatedUser.balance,
            profilePic: updatedUser.profilePic,
            bio: updatedUser.bio,
            skills: updatedUser.skills,
            linkedin: updatedUser.linkedin,
            github: updatedUser.github,
            twitter: updatedUser.twitter,
            completedGigsCount: updatedUser.completedGigsCount,
            averageRating: updatedUser.averageRating
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


export {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile,
    updateUserProfile // Export the new controller
};
