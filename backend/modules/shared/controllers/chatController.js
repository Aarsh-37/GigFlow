import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import Gig from '../models/Gig.js';
import Application from '../models/Application.js';
import { APPLICATION_STATUS } from '../utils/constants.js';

// @desc    Get messages for a gig (Only for owner and hired intern)
// @route   GET /api/chat/:gigId
// @access  Private
const getGigMessages = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Internship not found');
    }

    // Check if user is owner or hired intern
    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const hiredApp = await Application.findOne({ gigId, status: APPLICATION_STATUS.HIRED });
    const isHiredIntern = hiredApp && hiredApp.internId.toString() === req.user._id.toString();

    if (!isOwner && !isHiredIntern) {
        res.status(401);
        throw new Error('Not authorized to view chat for this internship');
    }

    const messages = await Message.find({ gigId })
        .populate('senderId', 'name avatar')
        .sort({ createdAt: 1 });

    res.json(messages);
});

// @desc    Send a message (Only for owner and hired intern)
// @route   POST /api/chat/:gigId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const { content } = req.body;
    const gig = await Gig.findById(gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Internship not found');
    }

    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const hiredApp = await Application.findOne({ gigId, status: APPLICATION_STATUS.HIRED });
    const isHiredIntern = hiredApp && hiredApp.internId.toString() === req.user._id.toString();

    if (!isOwner && !isHiredIntern) {
        res.status(401);
        throw new Error('Not authorized to send messages for this internship');
    }

    const message = await Message.create({
        gigId,
        senderId: req.user._id,
        content
    });

    // Emit message to the gig room
    if (req.io) {
        req.io.to(`gig_${gigId}`).emit('message', message);
    }

    res.status(201).json(message);
});

export { getGigMessages, sendMessage };
