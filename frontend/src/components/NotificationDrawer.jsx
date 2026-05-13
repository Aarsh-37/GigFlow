import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, X, CheckCircle2, MessageSquare, Briefcase, Trash2, IndianRupee } from 'lucide-react';
import { fetchNotifications, markRead, removeNotification } from '../slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDrawer = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchNotifications());
        }
    }, [isOpen, dispatch]);

    const handleMarkAsRead = (id) => {
        dispatch(markRead(id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_bid': return <IndianRupee className="text-green-500" />;
            case 'bid_accepted': return <CheckCircle2 className="text-blue-500" />;
            case 'new_message': return <MessageSquare className="text-purple-500" />;
            default: return <Bell className="text-indigo-500" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />
                    
                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors dark:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold">Fetching updates...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                                        <Bell size={40} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">All caught up!</h3>
                                    <p className="text-gray-500 dark:text-gray-400">No new notifications at the moment. We'll alert you when something happens.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n._id}
                                            className={`p-6 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 group relative ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                            onClick={() => !n.read && handleMarkAsRead(n._id)}
                                        >
                                            <div className="flex gap-4">
                                                <div className="mt-1 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0">
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className={`text-sm mb-1 ${!n.read ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {n.message}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                        </span>
                                                        {!n.read && (
                                                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(removeNotification(n._id));
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            {n.link && (
                                                <a 
                                                    href={n.link}
                                                    className="mt-3 inline-block text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                                                >
                                                    View Details →
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                                <button 
                                    onClick={() => notifications.forEach(n => !n.read && handleMarkAsRead(n._id))}
                                    className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm text-gray-700 dark:text-white hover:bg-gray-50 transition-colors"
                                >
                                    Mark All as Read
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationDrawer;
