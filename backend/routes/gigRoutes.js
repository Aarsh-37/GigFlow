import express from 'express';
import { body, validationResult } from 'express-validator'; // Keep my express-validator imports
import {
    getGigs,
    getGigById,
    createGig,
    startGig, // Keep remote added routes
    completeGig,
    closeGig
} from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isGigOwner } from '../middleware/checkOwnership.js'; // Keep remote middleware
// Removed: import { validate, createGigSchema } from '../middleware/validationMiddleware.js'; as I'm using express-validator

// My express-validator implementation for createGig
const createGigValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().isLength({ min: 20, max: 2000 }),
  body('budget').isFloat({ min: 1 }).withMessage('Budget must be a positive number'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const router = express.Router();

// Route for GET /api/gigs and POST /api/gigs
// Using my express-validator for createGig, and keeping remote routes
router.route('/')
    .get(getGigs)
    .post(protect, createGigValidator, handleValidationErrors, createGig); // Use my validator and handler

router.route('/:id')
    .get(getGigById);

// Remote added routes
router.patch('/:id/start', protect, isGigOwner, startGig);
router.patch('/:id/complete', protect, isGigOwner, completeGig);
router.patch('/:id/close', protect, isGigOwner, closeGig);

export default router;
