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
import disputeRoutes from './routes/disputeRoutes.js';
import passport from 'passport';
import configurePassport from './config/passportConfig.js';
import logger from './config/logger.js'; // Import Winston logger
import jwt from 'jsonwebtoken'; // Import JWT for verification
import { parse } from 'cookie'; // Import parse for cookie handling
import validateEnv from './config/envValidator.js';
import './config/bullmq.js'; 
import './config/cloudinary.js';

// Import Gig and Bid models for authorization check
import Gig from './models/Gig.js';
import Bid from './models/Bid.js';


// Import Swagger dependencies
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import specs from './swaggerDef.js'; // Import Swagger definitions

import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

// Validate environment variables
validateEnv();

// Connect to database
if (process.env.NODE_ENV !== 'test') {
    connectDB();
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
    max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/v1', globalLimiter);

// Strict Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'development' ? 1000 : 10, // Limit each IP to 1 login/register attempts per hour
    message: 'Too many authentication attempts, please try again after an hour'
});
app.use('/api/v1/auth', authLimiter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            process.env.FRONTEND_URL
        ].filter(Boolean),
        credentials: true
    }
});

// Swagger UI Setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


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

    // Join gig room with authorization check
    socket.on('join_gig', async (gigId) => {
        logger.debug(`Received join_gig event for gigId: ${gigId} from user ${socket.userId}`);
        try {
            const gig = await Gig.findById(gigId);
            if (!gig) {
                logger.warn(`Join gig failed: Gig not found for ID ${gigId}.`);
                return; // Gig not found, do nothing
            }

            // Check if the user is the owner or has bid on the gig
            const isOwner = gig.ownerId.toString() === socket.userId;
            const hasBid = await Bid.exists({ gigId: gigId, freelancerId: socket.userId });

            if (isOwner || hasBid) {
                socket.join(`gig_${gigId}`);
                logger.info(`Socket ${socket.id} (User: ${socket.userId}) joined gig room: gig_${gigId}`);
            } else {
                logger.warn(`Socket ${socket.id} (User: ${socket.userId}) unauthorized to join gig room: gig_${gigId}`);
                // Optionally, emit an error back to the client
                socket.emit('join_error', { message: 'Unauthorized to join this gig room.' });
            }
        } catch (error) {
            logger.error(`Error processing join_gig for gig ${gigId}:`, error);
            socket.emit('join_error', { message: 'An error occurred while trying to join the gig room.' });
        }
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
        'http://localhost:5175',
        'http://localhost:5176',
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/gigs', gigRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/disputes', disputeRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(port, () => logger.info(`Server started on port ${port}`));
}

export default app;
export { io, httpServer };
