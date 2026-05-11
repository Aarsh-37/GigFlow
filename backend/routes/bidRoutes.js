import express from 'express';
import {
    placeBid,
    getBidsByGig,
    hireFreelancer,
    updateBid,
    withdrawBid
} from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isBidOwner } from '../middleware/checkOwnership.js';
import { validate, placeBidSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, validate(placeBidSchema), placeBid);

router.route('/:gigId')
    .get(protect, getBidsByGig);

router.route('/:bidId/hire')
    .patch(protect, hireFreelancer);

router.route('/:id')
    .patch(protect, isBidOwner, updateBid)
    .delete(protect, isBidOwner, withdrawBid);

export default router;
