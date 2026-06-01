import express from 'express';
import { raiseDispute, getDisputes, resolveDispute } from '../controllers/disputeController.js';
import { protect, authorizeRoles } from '../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, raiseDispute)
    .get(protect, authorizeRoles('admin'), getDisputes);

router.route('/:id/resolve')
    .patch(protect, authorizeRoles('admin'), resolveDispute);

export default router;
