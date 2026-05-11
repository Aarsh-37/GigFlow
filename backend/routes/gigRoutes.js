import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    getGigs,
    getGigById,
    createGig,
    updateGig, // Import updateGig
    deleteGig, // Import deleteGig
    startGig,
    completeGig,
    closeGig
} from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isGigOwner } from '../middleware/checkOwnership.js';

// Validator for creating a gig (reused for updating)
const createGigValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().isLength({ min: 20, max: 2000 }),
  body('budget').isFloat({ min: 1 }).withMessage('Budget must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('bidDeadline').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid bid deadline format'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
];

// Validator for updating a gig (partial updates allowed)
const updateGigValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').optional().trim().notEmpty().isLength({ min: 20, max: 2000 }),
  body('budget').optional().isFloat({ min: 1 }).withMessage('Budget must be a positive number'),
  body('category').optional().trim().notEmpty().withMessage('Category is required'),
  body('bidDeadline').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid bid deadline format'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('attachments').optional().isArray().withMessage('Attachments must be an array'),
  // Status updates handled by specific endpoints, not here.
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const router = express.Router();

// Routes for /api/gigs
router.route('/')
    .get(getGigs)
    // Use createGigValidator for POST, handleValidationErrors, then createGig controller
    .post(protect, createGigValidator, handleValidationErrors, createGig);

// Routes for /api/gigs/:id
router.route('/:id')
    .get(getGigById)
    // Add PUT and DELETE routes for updating and deleting gigs
    .put(protect, isGigOwner, updateGigValidator, handleValidationErrors, updateGig) // Use updateGigValidator
    .delete(protect, isGigOwner, deleteGig);

// Routes for gig status transitions (protected by owner middleware)
router.patch('/:id/start', protect, isGigOwner, startGig);
router.patch('/:id/complete', protect, isGigOwner, completeGig);
router.patch('/:id/close', protect, isGigOwner, closeGig);

export default router;
