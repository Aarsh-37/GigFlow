import express from 'express';
import { getDashboardStats, getAnalytics } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDashboardStats);
router.get('/analytics', protect, getAnalytics);

export default router;
