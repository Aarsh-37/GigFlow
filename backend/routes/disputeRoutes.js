import express from 'express';
import { raiseDispute, getDisputes, resolveDispute } from '../controllers/disputeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, raiseDispute)
    .get(protect, adminOnly, getDisputes);

router.route('/:id/resolve')
    .patch(protect, adminOnly, resolveDispute);

export default router;
