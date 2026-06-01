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
import { protect, authorizeRoles } from '../../shared/middleware/authMiddleware.js';
import { isGigOwner, isGigOwnerOrHiredIntern } from '../../shared/middleware/checkOwnership.js';
import logger from '../../shared/config/logger.js'; // Import Winston logger
import { validateObjectId, validate } from '../../shared/middleware/validationMiddleware.js';
import { createGigSchema, updateGigSchema } from '../../shared/validations/gigSchema.js';


const router = express.Router();

// Routes for /api/gigs
router.get('/recommendations', protect, getRecommendations);

router.route('/')
    .get(getGigs)
    .post(protect, authorizeRoles('hirer', 'admin'), validate(createGigSchema), createGig);

// Routes for /api/gigs/:id
router.route('/:id')
    .get(validateObjectId('id'), getGigById)
    .put(protect, isGigOwner, validateObjectId('id'), validate(updateGigSchema), updateGig)
    .delete(protect, isGigOwner, validateObjectId('id'), deleteGig);

// Routes for gig status transitions (protected by owner middleware)
router.patch('/:id/start', protect, isGigOwner, validateObjectId('id'), startGig);
router.patch('/:id/complete', protect, isGigOwner, validateObjectId('id'), completeGig);
router.patch('/:id/close', protect, isGigOwnerOrHiredIntern, validateObjectId('id'), closeGig);

export default router;
