import asyncHandler from 'express-async-handler';
import * as gigService from '../../../services/gigService.js';
import Gig from '../../shared/models/Gig.js';
import Application from '../../shared/models/Application.js';
import User from '../../shared/models/User.js';
import createNotification from '../../shared/utils/notificationUtils.js';
import logger from '../../shared/config/logger.js';
import sendResponse from '../../shared/utils/sendResponse.js';
import { APPLICATION_STATUS } from '../../shared/utils/constants.js';

// @desc    Get all gigs with pagination, filtering, and sorting
// @route   GET /api/gigs
// @access  Public
const getGigs = asyncHandler(async (req, res) => {
    const { limit, cursor, ...rest } = req.query;
    const result = await gigService.fetchGigs({ 
        ...rest, 
        limit: limit ? parseInt(limit) : undefined, 
        cursor 
    });
    sendResponse(res, 200, true, 'Gigs fetched successfully', result);
});

// @desc    Get gig by ID
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name email avatar rating').lean();
    if (!gig) {
        res.status(404);
        throw new Error('Internship not found');
    }
    sendResponse(res, 200, true, 'Internship fetched successfully', gig);
});

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (Hirer)
const createGig = asyncHandler(async (req, res) => {
    const gig = await gigService.createGig({ ...req.body, ownerId: req.user._id });
    sendResponse(res, 201, true, 'Internship created successfully', gig);
});

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private (Owner)
const updateGig = asyncHandler(async (req, res) => {
    const gig = await gigService.updateGig(req.params.id, req.user._id, req.body);
    sendResponse(res, 200, true, 'Internship updated successfully', gig);
});

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private (Owner)
const deleteGig = asyncHandler(async (req, res) => {
    await gigService.deleteGig(req.params.id, req.user._id);
    sendResponse(res, 200, true, 'Internship deleted successfully');
});

// @desc    Start work on a gig
// @route   PATCH /api/gigs/:id/start
// @access  Private
const startGig = asyncHandler(async (req, res) => {
    const gig = await gigService.transitionStatus(req.params.id, req.user._id, 'in-progress');
    sendResponse(res, 200, true, 'Internship started successfully', gig);
});

// @desc    Complete an internship
// @route   PATCH /api/gigs/:id/complete
// @access  Private
const completeGig = asyncHandler(async (req, res) => {
    const gig = await gigService.transitionStatus(req.params.id, req.user._id, 'completed');

    if (req.io) {
        const hiredApp = await Application.findOne({ gigId: gig._id, status: APPLICATION_STATUS.HIRED });
        if (hiredApp) {
            await createNotification(req.io, {
                userId: hiredApp.internId,
                message: `The internship "${gig.title}" has been marked as completed by the hirer.`,
                type: 'gig_completed',
                link: `/gigs/${gig._id}`
            });
            req.io.to(hiredApp.internId.toString()).emit('dashboard_update');
        }
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    sendResponse(res, 200, true, 'Internship completed successfully', gig);
});

// @desc    Close an internship and release stipend
// @route   PATCH /api/gigs/:id/close
// @access  Private
const closeGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
        res.status(404);
        throw new Error('Internship not found');
    }

    const hiredApp = await Application.findOne({ gigId: gig._id, status: APPLICATION_STATUS.HIRED });
    const releasedAmount = gig.escrowAmount;

    const updatedGig = await gigService.transitionStatus(req.params.id, req.user._id, 'closed');
    updatedGig.escrowAmount = 0;
    await updatedGig.save();

    if (hiredApp) {
        const intern = await User.findById(hiredApp.internId);
        if (intern) {
            intern.balance += releasedAmount;
            intern.totalGigs += 1;
            await intern.save();

            if (req.io) {
                await createNotification(req.io, {
                    userId: hiredApp.internId,
                    message: `The internship "${gig.title}" has been closed. ₹${releasedAmount} stipend has been released to your balance!`,
                    type: 'gig_closed',
                    link: `/gigs/${gig._id}`
                });
                req.io.to(hiredApp.internId.toString()).emit('dashboard_update');
            }
        }
    }

    if (req.io) {
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    logger.info(`Internship ${gig._id} closed and stipend processed.`);
    sendResponse(res, 200, true, 'Internship closed and stipend processed successfully', updatedGig);
});

// @desc    Get recommended internships for an intern
// @route   GET /api/v1/gigs/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
    try {
        const userSkills = req.user.skills || [];
        
        if (userSkills.length === 0) {
            const gigs = await Gig.find({ status: 'open', isDeleted: false }).sort({ createdAt: -1 }).limit(10).lean();
            return sendResponse(res, 200, true, 'Latest internships', gigs);
        }

        const recommendedGigs = await Gig.find({
            status: 'open',
            isDeleted: { $ne: true },
            $or: [
                { tags: { $in: userSkills } },
                { category: { $in: userSkills } }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

        sendResponse(res, 200, true, 'Recommended internships', recommendedGigs);
    } catch (error) {
        sendResponse(res, 500, false, error.message);
    }
});

export { getGigs, getGigById, createGig, updateGig, deleteGig, startGig, completeGig, closeGig, getRecommendations };
