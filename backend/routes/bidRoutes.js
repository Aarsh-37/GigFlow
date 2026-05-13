import express from 'express';
import {
    createBid,
    getBidById,
    getBidsForGig,
    updateBid,
    deleteBid,
    acceptBid,
    rejectBid,
    withdrawBid
} from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isBidOwner, isGigOwner } from '../middleware/checkOwnership.js';
import { validateObjectId, validate } from '../middleware/validationMiddleware.js';
import { placeBidSchema, updateBidSchema } from '../validations/bidSchema.js';

const router = express.Router();

// Routes for creating and fetching bids
router.route('/')
    .post(protect, validate(placeBidSchema), createBid);

// Routes for specific bid operations by ID
router.route('/:id')
    .get(validateObjectId('id'), getBidById)
    .put(protect, isBidOwner, validateObjectId('id'), validate(updateBidSchema), updateBid)
    .delete(protect, isBidOwner, validateObjectId('id'), deleteBid);

// Routes for gig owner actions on bids
router.patch('/:id/accept', protect, isGigOwner, validateObjectId('id'), acceptBid);
router.patch('/:id/reject', protect, isGigOwner, validateObjectId('id'), rejectBid);
router.patch('/:id/withdraw', protect, isBidOwner, validateObjectId('id'), withdrawBid);

router.get('/gig/:gigId', protect, validateObjectId('gigId', 'params'), getBidsForGig);

export default router;