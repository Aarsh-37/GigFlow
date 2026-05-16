import Notification from '../models/Notification.js';
import logger from '../config/logger.js';

const createNotification = async (io, { userId, message, type, link }) => {
    try {
        // 1. Create persistent notification in DB
        const notification = await Notification.create({
            userId,
            message,
            type,
            link
        });

        // 2. Emit real-time event via Socket.IO
        if (io) {
            io.to(userId.toString()).emit('notification', notification);
            // Refresh dashboard for the recipient
            io.to(userId.toString()).emit('dashboard_update');
        }

        return notification;
    } catch (error) {
        logger.error(`Error creating notification: ${error.message}`);
    }
};

export default createNotification;
