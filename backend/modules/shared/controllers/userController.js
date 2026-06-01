import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Application from '../models/Application.js';
import logger from '../config/logger.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUtils.js';
import { saveFileLocally } from '../middleware/uploadMiddleware.js';
import sendResponse from '../utils/sendResponse.js';

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        sendResponse(res, 200, true, 'User fetched successfully', user);
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
        user.avatar = req.body.avatar || user.avatar;
        user.banner = req.body.banner || user.banner;
        user.linkedin = req.body.linkedin || user.linkedin;
        user.github = req.body.github || user.github;
        user.twitter = req.body.twitter || user.twitter;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        sendResponse(res, 200, true, 'Profile updated successfully', {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            bio: updatedUser.bio,
            skills: updatedUser.skills,
            avatar: updatedUser.avatar,
            banner: updatedUser.banner,
            linkedin: updatedUser.linkedin,
            github: updatedUser.github,
            twitter: updatedUser.twitter,
            role: updatedUser.role,
            rating: updatedUser.rating,
            totalGigs: updatedUser.totalGigs
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
    const gigs = await Gig.find({ ownerId: userId }).sort({ createdAt: -1 });
    sendResponse(res, 200, true, 'User gigs fetched successfully', gigs);
    logger.info(`Fetched gigs for user: ${userId}`);
});

// @desc    Get applications submitted by a user
// @route   GET /api/users/:id/applications
// @access  Public
const getUserApplications = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const applications = await Application.find({ internId: userId })
        .populate('gigId', 'title budget status')
        .sort({ createdAt: -1 });
    sendResponse(res, 200, true, 'User applications fetched successfully', applications);
    logger.info(`Fetched applications for user: ${userId}`);
});

// @desc    Upload avatar image
// @route   POST /api/v1/users/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No image file provided');
    }

    const cloudinaryConfigured =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;

    let avatarUrl;

    if (cloudinaryConfigured) {
        try {
            avatarUrl = await uploadBufferToCloudinary(req.file.buffer, 'gigflow_avatars', 'image');
        } catch (uploadError) {
            logger.error('Cloudinary avatar upload failed:', uploadError);
            res.status(500);
            throw new Error('Failed to upload image to cloud. Please try again.');
        }
    } else {
        // Fallback: save locally
        try {
            const localPath = saveFileLocally(req.file.buffer, req.file.originalname || 'avatar.jpg');
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            avatarUrl = `${baseUrl}${localPath}`;
        } catch (saveError) {
            res.status(500);
            throw new Error('Failed to save image file.');
        }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.avatar = avatarUrl;
    const updatedUser = await user.save();

    logger.info(`Avatar updated for user: ${updatedUser._id}`);
    sendResponse(res, 200, true, 'Avatar uploaded successfully', {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        banner: updatedUser.banner,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        linkedin: updatedUser.linkedin,
        github: updatedUser.github,
        twitter: updatedUser.twitter,
        rating: updatedUser.rating,
        totalGigs: updatedUser.totalGigs,
        balance: updatedUser.balance,
    });
});

// @desc    Upload banner image
// @route   POST /api/v1/users/upload-banner
// @access  Private
const uploadBanner = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No image file provided');
    }

    const cloudinaryConfigured =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;

    let bannerUrl;

    if (cloudinaryConfigured) {
        try {
            bannerUrl = await uploadBufferToCloudinary(req.file.buffer, 'gigflow_banners', 'image');
        } catch (uploadError) {
            logger.error('Cloudinary banner upload failed:', uploadError);
            res.status(500);
            throw new Error('Failed to upload image to cloud. Please try again.');
        }
    } else {
        // Fallback: save locally
        try {
            const localPath = saveFileLocally(req.file.buffer, req.file.originalname || 'banner.jpg');
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            bannerUrl = `${baseUrl}${localPath}`;
        } catch (saveError) {
            res.status(500);
            throw new Error('Failed to save image file.');
        }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.banner = bannerUrl;
    const updatedUser = await user.save();

    logger.info(`Banner updated for user: ${updatedUser._id}`);
    sendResponse(res, 200, true, 'Banner uploaded successfully', {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        banner: updatedUser.banner,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        linkedin: updatedUser.linkedin,
        github: updatedUser.github,
        twitter: updatedUser.twitter,
        rating: updatedUser.rating,
        totalGigs: updatedUser.totalGigs,
        balance: updatedUser.balance,
    });
});

export { getUserById, updateUserProfile, getUserGigs, getUserApplications, uploadAvatar, uploadBanner };
