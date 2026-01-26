import express from 'express';
import {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';
import { validate, registerSchema, loginSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), authUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        generateToken(res, req.user._id);
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/');
    }
);

export default router;
