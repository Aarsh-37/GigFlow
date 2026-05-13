import asyncHandler from 'express-async-handler';
import * as gigService from '../services/gigService.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import createNotification from '../utils/notificationUtils.js';
import logger from '../config/logger.js';
import sendResponse from '../utils/sendResponse.js';

// @desc    Get all gigs with pagination, filtering, and sorting
// @route   GET /api/gigs
// @access  Public
const getGigs = asyncHandler(async (req, res) => {
    const filters = {
        search: req.query.search,
        category: req.query.category,
        tags: req.query.tags,
        ownerId: req.query.owner,
        status: req.query.status || 'open'
    };

    const options = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 12,
        sortBy: req.query.sortBy
    };

    const result = await gigService.fetchGigs(filters, options);

    sendResponse(res, 200, true, 'Gigs fetched successfully', {
        gigs: result.gigs,
        page: result.page,
        limit: options.limit,
        totalPages: result.totalPages,
        totalGigs: result.total
    });
});

// @desc    Get gig by ID
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = asyncHandler(async (req, res) => {
    const gig = await gigService.fetchGigById(req.params.id);
    sendResponse(res, 200, true, 'Gig fetched successfully', gig);
});

// @desc    Create a gig
// @route   POST /api/gigs
// @access  Private
const createGig = asyncHandler(async (req, res) => {
    const gigData = {
        ...req.body,
        ownerId: req.user._id,
        status: 'open'
    };

    const createdGig = await gigService.createGig(gigData);
    logger.info(`Gig created: ${createdGig._id} by ${req.user._id}`);
    sendResponse(res, 201, true, 'Gig created successfully', createdGig);
});

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private (Owner only)
const updateGig = asyncHandler(async (req, res) => {
    const updatedGig = await gigService.updateGig(req.params.id, req.user._id, req.body);
    logger.info(`Gig updated: ${updatedGig._id} by ${req.user._id}`);
    sendResponse(res, 200, true, 'Gig updated successfully', updatedGig);
});

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private (Owner only)
const deleteGig = asyncHandler(async (req, res) => {
    await gigService.deleteGig(req.params.id, req.user._id);
    logger.info(`Gig deleted: ${req.params.id} by ${req.user._id}`);
    sendResponse(res, 200, true, 'Gig deleted successfully');
});

// @desc    Start a gig
// @route   PATCH /api/gigs/:id/start
// @access  Private
const startGig = asyncHandler(async (req, res) => {
    const gig = await gigService.transitionStatus(req.params.id, req.user._id, 'in-progress');

    if (req.io) {
        await createNotification(req.io, {
            userId: gig.ownerId,
            message: `Gig "${gig.title}" has started!`,
            type: 'gig_started',
            link: `/gigs/${gig._id}`
        });
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    sendResponse(res, 200, true, 'Gig started successfully', gig);
});

// @desc    Complete a gig
// @route   PATCH /api/gigs/:id/complete
// @access  Private
const completeGig = asyncHandler(async (req, res) => {
    const gig = await gigService.transitionStatus(req.params.id, req.user._id, 'completed');

    if (req.io) {
        const chosenBid = await Bid.findOne({ gigId: gig._id, status: 'hired' });
        if (chosenBid) {
            await createNotification(req.io, {
                userId: chosenBid.freelancerId,
                message: `The gig "${gig.title}" has been marked as completed by the client.`,
                type: 'gig_completed',
                link: `/gigs/${gig._id}`
            });
            req.io.to(chosenBid.freelancerId.toString()).emit('dashboard_update');
        }
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    sendResponse(res, 200, true, 'Gig completed successfully', gig);
});

// @desc    Close a gig
// @route   PATCH /api/gigs/:id/close
// @access  Private
const closeGig = asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id); // Need full gig object for escrow logic

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    const chosenBid = await Bid.findOne({ gigId: gig._id, status: 'hired' });
    const releasedAmount = gig.escrowAmount;

    // Perform transition via service
    const updatedGig = await gigService.transitionStatus(req.params.id, req.user._id, 'closed');
    updatedGig.escrowAmount = 0;
    await updatedGig.save();

    if (chosenBid) {
        const freelancer = await User.findById(chosenBid.freelancerId);
        if (freelancer) {
            freelancer.balance += releasedAmount;
            freelancer.totalGigs += 1; // Updated field name
            await freelancer.save();

            if (req.io) {
                await createNotification(req.io, {
                    userId: chosenBid.freelancerId,
                    message: `The gig "${gig.title}" has been closed. ₹${releasedAmount} has been released to your balance!`,
                    type: 'gig_closed',
                    link: `/gigs/${gig._id}`
                });
                req.io.to(chosenBid.freelancerId.toString()).emit('dashboard_update');
            }
        }
    }

    if (req.io) {
        req.io.to(req.user._id.toString()).emit('dashboard_update');
    }

    logger.info(`Gig ${gig._id} closed and payment processed.`);
    sendResponse(res, 200, true, 'Gig closed and payment processed successfully', updatedGig);
});

export { getGigs, getGigById, createGig, updateGig, deleteGig, startGig, completeGig, closeGig };
