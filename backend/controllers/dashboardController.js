import asyncHandler from 'express-async-handler';
import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
    // 1. Client Stats
    const postedGigs = await Gig.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    // 2. Freelancer Stats
    const appliedBids = await Bid.find({ freelancerId: req.user._id })
        .populate('gigId', 'title status ownerId budget')
        .sort({ createdAt: -1 });

    // 3. Current Hires (Active work for Client)
    const activeHires = await Gig.find({
        ownerId: req.user._id,
        status: { $in: ['assigned', 'in-progress', 'completed'] }
    }).populate('ownerId', 'name email');

    // 4. Active Work for Freelancer
    const hiredBids = appliedBids.filter(bid => bid.status === 'hired');

    res.json({
        client: {
            postedGigs,
            activeHires
        },
        freelancer: {
            appliedBids,
            activeWork: hiredBids
        },
        user: {
            completedGigsCount: req.user.completedGigsCount,
            averageRating: req.user.averageRating,
            balance: req.user.balance
        }
    });
});

export { getDashboardStats };
