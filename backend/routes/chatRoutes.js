import express from 'express';
import { getGigMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/:gigId')
    .get(protect, getGigMessages)
    .post(protect, sendMessage);

export default router;
