import express from 'express';
import { body, validationResult } from 'express-validator';
import { getGigs, getGigById, createGig } from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';

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

router.route('/').get(getGigs).post(protect, createGigValidator, handleValidationErrors, createGig);
router.route('/:id').get(getGigById);

export default router;
