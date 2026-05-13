import asyncHandler from 'express-async-handler';
import * as bidService from '../services/bidService.js';
import Bid from '../models/Bid.js';
import createNotification from '../utils/notificationUtils.js';
import logger from '../config/logger.js';
import sendResponse from '../utils/sendResponse.js';

// @desc    Create a bid
// @route   POST /api/bids
// @access  Private
const createBid = asyncHandler(async (req, res) => {
    const bidData = {
        ...req.body,
        freelancerId: req.user._id
    };

    const createdBid = await bidService.createBid(bidData);
    
    // Notify gig owner
    const bidWithGig = await Bid.findById(createdBid._id).populate('gigId');
    if (req.io) {
        await createNotification(req.io, {
            userId: bidWithGig.gigId.ownerId,
            message: `New bid received for "${bidWithGig.gigId.title}"`,
            type: 'new_bid',
            link: `/gigs/${bidWithGig.gigId._id}`
        });
    }

    logger.info(`Bid created: ${createdBid._id} by ${req.user._id}`);
    sendResponse(res, 201, true, 'Bid placed successfully', createdBid);
});

// @desc    Get bids for a gig
// @route   GET /api/bids/gig/:gigId
// @access  Private
const getBidsForGig = asyncHandler(async (req, res) => {
    const bids = await Bid.find({ gigId: req.params.gigId })
        .populate('freelancerId', 'name email avatar rating')
        .sort('-createdAt');
    
    sendResponse(res, 200, true, 'Bids fetched successfully', bids);
});

// @desc    Update a bid
// @route   PUT /api/bids/:id
// @access  Private
const updateBid = asyncHandler(async (req, res) => {
    const updatedBid = await bidService.updateBid(req.params.id, req.user._id, req.body);
    logger.info(`Bid updated: ${updatedBid._id} by ${req.user._id}`);
    sendResponse(res, 200, true, 'Bid updated successfully', updatedBid);
});

// @desc    Withdraw a bid
// @route   PATCH /api/bids/:id/withdraw
// @access  Private
const withdrawBid = asyncHandler(async (req, res) => {
    const withdrawnBid = await bidService.withdrawBid(req.params.id, req.user._id);
    logger.info(`Bid withdrawn: ${req.params.id} by ${req.user._id}`);
    sendResponse(res, 200, true, 'Bid withdrawn successfully', withdrawnBid);
});

// @desc    Accept a bid
// @route   PATCH /api/bids/:id/accept
// @access  Private (Gig Owner only)
const acceptBid = asyncHandler(async (req, res) => {
    const acceptedBid = await bidService.acceptBid(req.params.id, req.user._id);

    if (req.io) {
        await createNotification(req.io, {
            userId: acceptedBid.freelancerId,
            message: `Your bid for "${acceptedBid.gigId.title}" has been accepted!`,
            type: 'bid_accepted',
            link: `/gigs/${acceptedBid.gigId._id}`
        });
        // Update both dashboards
        req.io.to(req.user._id.toString()).emit('dashboard_update');
        req.io.to(acceptedBid.freelancerId.toString()).emit('dashboard_update');
    }

    logger.info(`Bid accepted: ${acceptedBid._id} by ${req.user._id}`);
    sendResponse(res, 200, true, 'Bid accepted successfully', acceptedBid);
});

// @desc    Reject a bid
// @route   PATCH /api/bids/:id/reject
// @access  Private (Gig Owner only)
const rejectBid = asyncHandler(async (req, res) => {
    const bid = await Bid.findById(req.params.id).populate('gigId');
    if (!bid || bid.gigId.ownerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    bid.status = 'rejected';
    await bid.save();

    sendResponse(res, 200, true, 'Bid rejected successfully');
});

// @desc    Get bid by ID
const getBidById = asyncHandler(async (req, res) => {
    const bid = await Bid.findById(req.params.id).populate('freelancerId', 'name avatar rating');
    if (!bid) {
        res.status(404);
        throw new Error('Bid not found');
    }
    sendResponse(res, 200, true, 'Bid fetched successfully', bid);
});

// @desc    Delete a bid
const deleteBid = asyncHandler(async (req, res) => {
    const bid = await Bid.findById(req.params.id);
    if (!bid || bid.freelancerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }
    await bid.deleteOne();
    sendResponse(res, 200, true, 'Bid deleted successfully');
});

export {
    createBid,
    getBidsForGig,
    updateBid,
    withdrawBid,
    acceptBid,
    rejectBid,
    getBidById,
    deleteBid
};
