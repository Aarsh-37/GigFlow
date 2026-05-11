import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { fetchNotifications, markRead } from '../slices/notificationSlice'; // Import thunks and actions
import { formatDistanceToNow } from 'date-fns'; // For human-readable timestamps

const NotificationDropdown = () => {
    const dispatch = useDispatch();
    // Access notifications and unreadCount from the Redux store
    const { items: notifications, loading, error, unreadCount } = useSelector((state) => state.notifications);
    const { userInfo } = useSelector((state) => state.auth); // To check if user is logged in

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications when component mounts or user logs in
    useEffect(() => {
        if (userInfo) {
            dispatch(fetchNotifications());
        }
    }, [dispatch, userInfo]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAllRead = () => {
        // Mark all unread notifications as read
        notifications.forEach(notification => {
            if (!notification.read) {
                dispatch(markRead(notification._id));
            }
        });
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            dispatch(markRead(notification._id));
        }
        setIsOpen(false); // Close dropdown after clicking a notification
        // Navigate to the link associated with the notification, if any
        if (notification.link) {
            // Use window.location.href for full page navigation if the link is external or requires a full reload
            // For internal routing, React Router's navigate could be used if link is a path
            window.location.href = notification.link;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="p-2 rounded-full text-slate-400 hover:text-primary-600 transition-colors relative"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                        <h3 className="font-bold text-slate-900">Notifications ({unreadCount} unread)</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-primary-600 text-xs hover:underline">Mark all as read</button>
                        )}
                    </div>
                    {loading && (
                        <div className="p-4 text-center text-slate-400">Loading notifications...</div>
                    )}
                    {error && (
                        <div className="p-4 text-center text-red-500">Error: {error}</div>
                    )}
                    {!loading && !error && notifications.length === 0 && (
                        <div className="p-4 text-center text-slate-400">No notifications.</div>
                    )}
                    {!loading && !error && notifications.length > 0 && (
                        <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                            {notifications.map((notification) => (
                                <li
                                    key={notification._id}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-primary-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <Bell size={18} className={`text-primary-500 ${!notification.read ? 'font-bold' : ''}`} />
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notification.read ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
                                    </div>
                                    {!notification.read && (
                                        <span className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
