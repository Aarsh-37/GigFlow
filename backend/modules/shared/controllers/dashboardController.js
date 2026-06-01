import asyncHandler from 'express-async-handler';
import Gig from '../models/Gig.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import sendResponse from '../utils/sendResponse.js';
import { APPLICATION_STATUS } from '../utils/constants.js';

// @desc    Get dashboard stats
// @route   GET /api/v1/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Hirer Stats
    const postedGigs = await Gig.find({ ownerId: userId }).sort({ createdAt: -1 });
    
    // Calculate total spent (completed/closed gigs)
    const totalSpent = postedGigs
        .filter(gig => ['completed', 'closed'].includes(gig.status))
        .reduce((sum, gig) => sum + gig.budget, 0);

    // Active Hires (Gigs assigned/in-progress/completed for Hirer)
    const activeInternsData = await Application.find({
        gigId: { $in: postedGigs.filter(g => ['assigned', 'in-progress', 'completed'].includes(g.status)).map(g => g._id) },
        status: APPLICATION_STATUS.HIRED
    }).populate('internId', 'name email avatar').populate('gigId', 'title status');

    // 2. Intern Stats
    const applications = await Application.find({ internId: userId })
        .populate('gigId', 'title status ownerId budget')
        .sort({ createdAt: -1 });

    // Calculate total earned (closed gigs where intern was hired)
    const totalEarned = applications
        .filter(app => app.status === APPLICATION_STATUS.HIRED && app.gigId?.status === 'closed')
        .reduce((sum, app) => sum + (app.gigId?.budget || 0), 0);

    // Successful Applications (Active work for Intern: hired and gig not closed)
    const activeInternships = applications.filter(app => 
        app.status === APPLICATION_STATUS.HIRED && 
        ['assigned', 'in-progress', 'completed'].includes(app.gigId?.status)
    );

    sendResponse(res, 200, true, 'Dashboard stats fetched successfully', {
        hirer: {
            postedGigs,
            activeInterns: activeInternsData.map(app => ({
                _id: app._id,
                gigId: app.gigId,
                internName: app.internId?.name,
                internAvatar: app.internId?.avatar,
                status: app.status
            })),
            totalSpent
        },
        intern: {
            applications,
            activeInternships,
            totalEarned
        },
        user: {
            totalGigs: req.user.totalGigs,
            rating: req.user.rating,
            balance: req.user.balance
        }
    });
});

// @desc    Get advanced analytics for the dashboard
// @route   GET /api/v1/dashboard/analytics
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const totalApplications = await Application.countDocuments({ internId: userId });
    const hiredApplications = await Application.countDocuments({ internId: userId, status: APPLICATION_STATUS.HIRED });
    const successRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;

    sendResponse(res, 200, true, 'Analytics fetched successfully', {
        successRate,
        totalApplications,
        hiredApplications
    });
});

export { getDashboardStats, getAnalytics };
