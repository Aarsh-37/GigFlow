import asyncHandler from 'express-async-handler';
import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';

const isGigOwner = asyncHandler(async (req, res, next) => {
    const gigId = req.params.gigId || req.body.gigId || req.params.id;
    const gig = await Gig.findById(gigId);

    if (!gig) {
        res.status(404);
        throw new Error('Gig not found');
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized: You do not own this gig');
    }

    req.gig = gig;
    next();
});

const isBidOwner = asyncHandler(async (req, res, next) => {
    const bidId = req.params.bidId || req.body.bidId || req.params.id;
    const bid = await Bid.findById(bidId);

    if (!bid) {
        res.status(404);
        throw new Error('Bid not found');
    }

    if (bid.freelancerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized: You do not own this bid');
    }

    req.bid = bid;
    next();
});

export { isGigOwner, isBidOwner };
