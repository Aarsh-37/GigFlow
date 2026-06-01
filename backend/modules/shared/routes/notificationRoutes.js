import express from 'express';
import { getNotifications, markAsRead, deleteNotification, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getNotifications);

// Must come before /:id routes to avoid route conflict
router.route('/read-all')
    .patch(protect, markAllAsRead);

router.route('/:id/read')
    .patch(protect, markAsRead);

router.route('/:id')
    .delete(protect, deleteNotification);

export default router;
