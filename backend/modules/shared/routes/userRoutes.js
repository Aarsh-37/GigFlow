import express from 'express';
import { getUserById, getUserGigs, uploadAvatar, uploadBanner } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload, validateFileType } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Avatar upload route — must come before /:id to avoid conflict
router.post(
    '/upload-avatar',
    protect,
    upload.single('avatar'),
    validateFileType(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    uploadAvatar
);

// Banner upload route
router.post(
    '/upload-banner',
    protect,
    upload.single('banner'),
    validateFileType(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    uploadBanner
);

router.route('/:id')
    .get(getUserById);

// Routes for user's gigs and applications
router.route('/:id/gigs')
    .get(getUserGigs);

export default router;
