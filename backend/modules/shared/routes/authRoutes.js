import express from 'express';
import {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    addBalance
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';
import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validations/authSchema.js';
import { updateUserProfileSchema } from '../validations/userSchema.js';

import { authLimiter } from '../config/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), authUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);
router.put('/me', protect, validate(updateUserProfileSchema), updateUserProfile);
router.post('/add-balance', protect, authorizeRoles('hirer', 'admin'), addBalance);

// Google Auth Routes
router.get('/google', authLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    authLimiter,
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login` }),
    (req, res) => {
        // Successful authentication
        generateToken(res, req.user);
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/');
    }
);

export default router;
