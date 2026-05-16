import express from 'express';
import {
    getGigs,
    getGigById,
    createGig,
    updateGig,
    deleteGig,
    startGig,
    completeGig,
    closeGig,
    getRecommendations
} from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isGigOwner } from '../middleware/checkOwnership.js';
import logger from '../config/logger.js'; // Import Winston logger
import { validateObjectId, validate } from '../middleware/validationMiddleware.js';
import { createGigSchema, updateGigSchema } from '../validations/gigSchema.js';


const router = express.Router();

// Routes for /api/gigs
router.get('/recommendations', protect, getRecommendations);

router.route('/')
    .get(getGigs)
    .post(protect, validate(createGigSchema), createGig);

// Routes for /api/gigs/:id
router.route('/:id')
    .get(validateObjectId('id'), getGigById)
    .put(protect, isGigOwner, validateObjectId('id'), validate(updateGigSchema), updateGig)
    .delete(protect, isGigOwner, validateObjectId('id'), deleteGig);

// Routes for gig status transitions (protected by owner middleware)
router.patch('/:id/start', protect, isGigOwner, validateObjectId('id'), startGig);
router.patch('/:id/complete', protect, isGigOwner, validateObjectId('id'), completeGig);
router.patch('/:id/close', protect, isGigOwner, validateObjectId('id'), closeGig);

export default router;
