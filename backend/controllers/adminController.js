import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Gig from '../models/Gig.js';

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Get all gigs (Admin only)
// @route   GET /api/admin/gigs
// @access  Private/Admin
const getAllGigs = asyncHandler(async (req, res) => {
    const gigs = await Gig.find({}).populate('ownerId', 'name email');
    res.json(gigs);
});

// @desc    Delete a gig (Admin only)
// @route   DELETE /api/admin/gigs/:id
// @access  Private/Admin
const deleteGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (gig) {
        await gig.deleteOne();
        res.json({ message: 'Gig removed' });
    } else {
        res.status(404);
        throw new Error('Gig not found');
    }
});

// @desc    Update user profile (e.g., block/unblock)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            role: updatedUser.role
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { getAllUsers, getAllGigs, deleteGig, updateUserRole };
