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


import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

connectDB();

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

io.on('connection', (socket) => {
    // Join a room based on userId (sent from client or extracted from handshake usually, 
    // for simplicity we'll let client emit 'join')
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('join_gig', (gigId) => {
        socket.join(`gig_${gigId}`);
        console.log(`User joined gig room: gig_${gigId}`);
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
        process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null
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

httpServer.listen(port, () => console.log(`Server started on port ${port}`));
