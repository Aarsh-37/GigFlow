import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

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
            completedGigsCount: updatedUser.completedGigsCount,
            averageRating: updatedUser.averageRating
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { getUserById, updateUserProfile };
