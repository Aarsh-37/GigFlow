import asyncHandler from 'express-async-handler';
import * as authService from '../../../services/authService.js';
import generateToken from '../utils/generateToken.js';
import sendResponse from '../utils/sendResponse.js';
import logger from '../config/logger.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    if (user) {
        generateToken(res, user);
        sendResponse(res, 201, true, 'User registered successfully', {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            balance: user.balance,
            avatar: user.avatar,
            banner: user.banner,
            bio: user.bio,
            skills: user.skills,
            linkedin: user.linkedin,
            github: user.github,
            twitter: user.twitter,
            totalGigs: user.totalGigs,
            rating: user.rating
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.login(email, password);

    generateToken(res, user);
    sendResponse(res, 200, true, 'User authenticated successfully', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        skills: user.skills,
        linkedin: user.linkedin,
        github: user.github,
        twitter: user.twitter,
        totalGigs: user.totalGigs,
        rating: user.rating
    });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    sendResponse(res, 200, true, 'Logged out successfully');
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        balance: req.user.balance,
        avatar: req.user.avatar,
        banner: req.user.banner,
        bio: req.user.bio,
        skills: req.user.skills,
        linkedin: req.user.linkedin,
        github: req.user.github,
        twitter: req.user.twitter,
        totalGigs: req.user.totalGigs,
        rating: req.user.rating
    };
    sendResponse(res, 200, true, 'User profile fetched successfully', user);
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const updatedUser = await authService.updateProfile(req.user._id, req.body);

    logger.info(`User profile updated: ${updatedUser._id}`);
    sendResponse(res, 200, true, 'Profile updated successfully', {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        balance: updatedUser.balance,
        avatar: updatedUser.avatar,
        banner: updatedUser.banner,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        linkedin: updatedUser.linkedin,
        github: updatedUser.github,
        twitter: updatedUser.twitter,
        totalGigs: updatedUser.totalGigs,
        rating: updatedUser.rating
    });
});

// @desc    Add balance to hirer wallet
// @route   POST /api/v1/auth/add-balance
// @access  Private (Hirer / Admin)
const addBalance = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
        res.status(400);
        throw new Error('Please enter a valid positive amount.');
    }
    if (parsed > 100000) {
        res.status(400);
        throw new Error('Maximum top-up per transaction is ₹1,00,000.');
    }

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.balance = (user.balance || 0) + parsed;
    const updatedUser = await user.save();

    logger.info(`Wallet top-up: ₹${parsed} added for user ${updatedUser._id}. New balance: ₹${updatedUser.balance}`);
    sendResponse(res, 200, true, `₹${parsed.toLocaleString('en-IN')} added to wallet successfully`, {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        balance: updatedUser.balance,
        avatar: updatedUser.avatar,
        banner: updatedUser.banner,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        linkedin: updatedUser.linkedin,
        github: updatedUser.github,
        twitter: updatedUser.twitter,
        totalGigs: updatedUser.totalGigs,
        rating: updatedUser.rating
    });
});

export {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    addBalance
};
