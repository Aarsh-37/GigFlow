import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in cookies or Authorization header
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.userId).select('-password');

            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

/**
 * Middleware to restrict access by role.
 * Usage: authorizeRoles('admin', 'hirer')
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized, no user found');
        }
        
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`Forbidden: Access denied for role '${req.user.role}'. Required: ${roles.join(', ')}`);
        }
        
        next();
    };
};

export { protect, authorizeRoles };
