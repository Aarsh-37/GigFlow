import express from 'express';
import { getUserById, updateUserProfile, getUserGigs, getUserBids } from '../controllers/userController.js'; // Import new controller functions
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
    .patch(protect, updateUserProfile);

router.route('/:id')
    .get(getUserById);

// New routes for user's gigs and bids
router.route('/:id/gigs')
    .get(getUserGigs);

router.route('/:id/bids')
    .get(getUserBids);

export default router;
