import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import bidRoutes from './routes/bidRoutes.js';


import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

connectDB();

const app = express();
// Trust proxy is required for secure cookies on Render/Heroku
app.set('trust proxy', 1);

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

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

httpServer.listen(port, () => console.log(`Server started on port ${port}`));
