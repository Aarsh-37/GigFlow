import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * Connects to MongoDB with retry logic to prevent process crashes.
 * Implements exponential backoff for connection attempts.
 */
const connectDB = async () => {
    const connOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };

    const attemptConnection = async (retryCount = 0) => {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, connOptions);
            logger.info(`MongoDB Connected: ${conn.connection.host}`);
        } catch (error) {
            logger.error(`MongoDB Connection Error (Attempt ${retryCount + 1}): ${error.message}`);
            
            // In development/test, we want to retry instead of crashing the process
            // Exponential backoff up to 30 seconds
            const retryDelay = Math.min(Math.pow(2, retryCount) * 1000, 30000); 
            
            logger.info(`Retrying MongoDB connection in ${retryDelay / 1000} seconds...`);
            setTimeout(() => attemptConnection(retryCount + 1), retryDelay);
        }
    };

    // Initial connection attempt
    attemptConnection();
};

// Global connection event listeners for better monitoring
mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB. Re-connecting in background...');
});

mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB.');
});

export default connectDB;
