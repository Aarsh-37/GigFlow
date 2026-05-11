import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';

// @desc    Get messages for a gig (Only for owner and hired freelancer)
// @route   GET /api/chat/:gigId
// @access  Private
const getGigMessages = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    // Check if user is owner or hired freelancer
    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const hiredBid = await Bid.findOne({ gigId, status: 'hired' });
    const isHiredFreelancer = hiredBid && hiredBid.freelancerId.toString() === req.user._id.toString();

    if (!isOwner && !isHiredFreelancer) {
        res.status(401);
        throw new Error('Not authorized to view chat for this gig');
    }

    const messages = await Message.find({ gigId })
        .populate('senderId', 'name profilePic')
        .sort({ createdAt: 1 });

    res.json(messages);
});

// @desc    Send a message (Only for owner and hired freelancer)
// @route   POST /api/chat/:gigId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const { content } = req.body;
    const gig = await Gig.findById(gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    const isOwner = gig.ownerId.toString() === req.user._id.toString();
    const hiredBid = await Bid.findOne({ gigId, status: 'hired' });
    const isHiredFreelancer = hiredBid && hiredBid.freelancerId.toString() === req.user._id.toString();

    if (!isOwner && !isHiredFreelancer) {
        res.status(401);
        throw new Error('Not authorized to send messages for this gig');
    }

    const message = await Message.create({
        gigId,
        senderId: req.user._id,
        content
    });

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name profilePic');

    // Emit to socket room
    req.io.to(`gig_${gigId}`).emit('new_message', populatedMessage);

    res.status(201).json(populatedMessage);
});

export { getGigMessages, sendMessage };
