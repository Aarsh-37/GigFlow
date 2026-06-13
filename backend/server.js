import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './modules/shared/config/db.js';
import { notFound, errorHandler } from './modules/shared/middleware/errorMiddleware.js';
import helmet from 'helmet';
import { globalLimiter, authLimiter, strictLimiter } from './modules/shared/config/rateLimiter.js';
import authRoutes from './modules/shared/routes/authRoutes.js';
import gigRoutes from './modules/hiring/routes/gigRoutes.js';
import applicationRoutes from './modules/intern/routes/applicationRoutes.js';
import userRoutes from './modules/shared/routes/userRoutes.js';
import reviewRoutes from './modules/shared/routes/reviewRoutes.js';
import dashboardRoutes from './modules/shared/routes/dashboardRoutes.js';
import notificationRoutes from './modules/shared/routes/notificationRoutes.js';
import chatRoutes from './modules/shared/routes/chatRoutes.js';
import workspaceRoutes from './modules/shared/routes/workspaceRoutes.js';
import adminRoutes from './modules/hiring/routes/adminRoutes.js';
import disputeRoutes from './modules/hiring/routes/disputeRoutes.js';
import passport from 'passport';
import configurePassport from './modules/shared/config/passportConfig.js';
import logger from './modules/shared/config/logger.js'; // Import Winston logger
import jwt from 'jsonwebtoken'; // Import JWT for verification
import { parse } from 'cookie'; // Import parse for cookie handling
import validateEnv from './modules/shared/config/envValidator.js';
import { requestIdMiddleware } from './modules/shared/middleware/requestId.js';
import './modules/shared/config/bullmq.js';

// Import Gig and Application models for authorization check
import Gig from './modules/shared/models/Gig.js';
import Application from './modules/shared/models/Application.js';


// Import Swagger dependencies
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi.js';

import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Validate environment variables
validateEnv();

// Connect to database
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

configurePassport();

const app = express();

// 1. Request ID & Logging
app.use(requestIdMiddleware);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 2. CORS (Must be before routes and other security middleware)
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

// 3. Security & Parsing
app.set('trust proxy', 1);
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// 4. Rate Limiting (Applied to /api/v1)
app.use('/api/v1', globalLimiter);
app.use('/api/v1/gigs/:id/start', strictLimiter);
app.use('/api/v1/gigs/:id/complete', strictLimiter);
app.use('/api/v1/gigs/:id/close', strictLimiter);

// 5. Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// 6. Static file serving for locally uploaded resumes (fallback when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    logger.info(`A user connected: ${socket.userId}`);

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
                socket.emit('join_error', { message: 'Internship not found.' });
                return;
            }

            const isOwner = gig.ownerId.toString() === socket.userId;
            const isHiredIntern = gig.teamMembers && gig.teamMembers.some(id => id.toString() === socket.userId);

            if (isOwner || isHiredIntern) {
                socket.join(`gig_${gigId}`);
                logger.info(`Socket ${socket.id} (User: ${socket.userId}) joined gig room: gig_${gigId}`);
                socket.emit('joined_gig', { gigId });
            } else {
                logger.warn(`Socket ${socket.id} (User: ${socket.userId}) unauthorized to join gig room: gig_${gigId}`);
                socket.emit('join_error', { message: 'Unauthorized to join this chat room.' });
            }
        } catch (error) {
            logger.error(`Error processing join_gig for gig ${gigId}:`, error);
            socket.emit('join_error', { message: 'An error occurred while trying to join the chat room.' });
        }
    });

    socket.on('disconnect', () => {
        logger.info(`User ${socket.userId} disconnected from socket ${socket.id}`);
    });
});

// Middleware to make io available in controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/gigs', gigRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
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
