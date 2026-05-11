import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { placeBid, getBidsByGig, hireFreelancer, updateBid, withdrawBid } from '../controllers/bidController.js'; // Import withdrawBid
import { body, param } from 'express-validator'; // Import for validation
import { validateObjectId } from '../middleware/validationMiddleware.js'; // Assuming validationMiddleware exists for ObjectId validation

const router = express.Router();

// Validate gigId for routes requiring it
const validateGigId = [
    param('gigId').isMongoId().withMessage('Invalid Gig ID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validate bidId for routes requiring it
const validateBidId = [
    param('bidId').isMongoId().withMessage('Invalid Bid ID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Routes for /api/bids
router.route('/')
    .post(protect, validateObjectId('gigId', 'body'), body('message').trim().notEmpty(), body('price').isFloat({ min: 1 }), (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }, placeBid);

// Route to get bids for a specific gig (Owner only)
router.route('/:gigId')
    .get(protect, validateGigId, getBidsByGig);

// Route to hire a freelancer for a specific bid
router.route('/:bidId/hire')
    .patch(protect, validateBidId, hireFreelancer);

// Route to update a bid (Freelancer only)
router.route('/:id') // Assuming :id here refers to bidId for update
    .patch(protect, validateBidId, body('message').optional().trim(), body('price').optional().isFloat({ min: 1 }), (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }, updateBid);

// Route to withdraw a bid (Freelancer only)
router.route('/:id') // Assuming :id here refers to bidId for withdrawal
    .delete(protect, validateBidId, withdrawBid);


export default router;
