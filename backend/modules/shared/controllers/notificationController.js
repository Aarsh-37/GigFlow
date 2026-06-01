import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import sendResponse from '../utils/sendResponse.js';

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

    sendResponse(res, 200, true, 'Notifications fetched successfully', notifications);
});

// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    notification.isRead = true;
    await notification.save();

    sendResponse(res, 200, true, 'Notification marked as read', notification);
});

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await notification.deleteOne();

    sendResponse(res, 200, true, 'Notification deleted successfully');
});

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
    );

    sendResponse(res, 200, true, 'All notifications marked as read');
});

export { getNotifications, markAsRead, deleteNotification, markAllAsRead };
