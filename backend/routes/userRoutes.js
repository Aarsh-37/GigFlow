import express from 'express';
import { getUserById, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
    .patch(protect, updateUserProfile);

router.route('/:id')
    .get(getUserById);

export default router;
