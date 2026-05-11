import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import passport from 'passport';
import configurePassport from './config/passportConfig.js';
import logger from './config/logger.js'; // Import Winston logger
import jwt from 'jsonwebtoken'; // Import JWT for verification
import { parse } from 'cookie'; // Import parse for cookie handling

import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'NODE_ENV', 'FRONTEND_URL'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    logger.error(`FATAL ERROR: Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// Check for JWT_SECRET (already added, but this ensures it's checked if PORT, MONGO_URI etc. are missing)
if (!process.env.JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
  process.exit(1); // Exit the process if JWT_SECRET is missing
}

configurePassport();

const app = express();
// Trust proxy is required for secure cookies on Render/Heroku
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());

// Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', globalLimiter);

// Strict Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register attempts per hour
    message: 'Too many authentication attempts, please try again after an hour'
});
app.use('/api/auth', authLimiter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.FRONTEND_URL
        ].filter(Boolean),
        credentials: true
    }
});

// Socket.IO Authentication Middleware
io.use((socket, next) => {
    logger.debug('Socket.IO authentication middleware started.');
    const cookies = parse(socket.handshake.headers.cookie || '');
    const token = cookies.jwt;

    if (!token) {
        logger.warn('Socket connection rejected: No JWT token found in cookies.');
        return next(new Error('Authentication error: No token provided.'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user ID to the socket object
        socket.userId = decoded.userId;
        logger.info(`Socket authenticated successfully. User ID: ${socket.userId}`);
        next();
    } catch (error) {
        logger.warn(`Socket authentication failed: ${error.message}`);
        next(new Error('Authentication error: Invalid token.'));
    }
});

io.on('connection', (socket) => {
    logger.info(`A user connected: ${socket.userId}`); // Use socket.userId now

    // Join a room based on authenticated userId
    socket.join(socket.userId);
    logger.info(`Socket ${socket.id} joined room for user ${socket.userId}`);

    socket.on('join_gig', (gigId) => {
        socket.join(`gig_${gigId}`);
        logger.debug(`Socket ${socket.id} joined gig room: gig_${gigId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`User ${socket.userId} disconnected from socket ${socket.id}`);
        // Potentially clean up rooms or user presence here if needed
    });
});

// Middleware to make io available in controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

httpServer.listen(port, () => logger.info(`Server started on port ${port}`)); // Use logger.info
