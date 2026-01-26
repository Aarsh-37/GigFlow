import express from 'express';
import {
    getGigs,
    getGigById,
    createGig,
    startGig,
    completeGig,
    closeGig
} from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isGigOwner } from '../middleware/checkOwnership.js';
import { validate, createGigSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getGigs)
    .post(protect, validate(createGigSchema), createGig);

router.route('/:id')
    .get(getGigById);

router.patch('/:id/start', protect, isGigOwner, startGig);
router.patch('/:id/complete', protect, isGigOwner, completeGig);
router.patch('/:id/close', protect, isGigOwner, closeGig);

export default router;
