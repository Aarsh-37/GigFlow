import asyncHandler from 'express-async-handler';
import User from '../../shared/models/User.js';
import Gig from '../../shared/models/Gig.js';
import sendResponse from '../../shared/utils/sendResponse.js';

/**
 * @desc    Get all users
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    // Map users to include virtual/derived fields if needed, or just send as is
    // The AdminPanel expects user.totalGigs and user.rating
    sendResponse(res, 200, true, 'Users retrieved successfully', users);
});

/**
 * @desc    Get all gigs
 * @route   GET /api/v1/admin/gigs
 * @access  Private/Admin
 */
export const getAllGigs = asyncHandler(async (req, res) => {
    const gigs = await Gig.find({}).populate('ownerId', 'name email');
    sendResponse(res, 200, true, 'Gigs retrieved successfully', gigs);
});

/**
 * @desc    Delete a gig
 * @route   DELETE /api/v1/admin/gigs/:id
 * @access  Private/Admin
 */
export const deleteGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    await gig.deleteOne();
    sendResponse(res, 200, true, 'Gig deleted successfully');
});

/**
 * @desc    Update user role
 * @route   PATCH /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.role = req.body.role || user.role;
    await user.save();

    sendResponse(res, 200, true, 'User role updated successfully', user);
});
