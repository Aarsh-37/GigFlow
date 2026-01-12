import express from 'express';
import { placeBid, getBidsByGig, hireFreelancer } from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, placeBid);
router.route('/:gigId').get(protect, getBidsByGig);
router.route('/:bidId/hire').patch(protect, hireFreelancer);

export default router;
