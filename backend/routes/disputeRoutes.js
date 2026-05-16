import express from 'express';
import { raiseDispute, getDisputes, resolveDispute } from '../controllers/disputeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, raiseDispute)
    .get(protect, isAdmin, getDisputes);

router.route('/:id/resolve')
    .patch(protect, isAdmin, resolveDispute);

export default router;
