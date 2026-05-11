import mongoose from 'mongoose';
import logger from './logger.js'; // Import the Winston logger

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`); // Use logger.info
    } catch (error) {
        logger.error(`Error: ${error.message}`); // Use logger.error
        process.exit(1);
    }
};

export default connectDB;
