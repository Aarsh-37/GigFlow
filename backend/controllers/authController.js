import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendResponse from '../utils/sendResponse.js'; // Import the sendResponse utility

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
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        balance: req.user.balance,
        profilePic: req.user.profilePic,
        completedGigsCount: req.user.completedGigsCount,
        averageRating: req.user.averageRating
    };
    sendResponse(res, 200, true, 'User profile fetched successfully', user);
});

export {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile
};
