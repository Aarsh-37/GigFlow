import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Check } from 'lucide-react';
import { markRead } from '../slices/notificationSlice';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { items, unreadCount } = useSelector((state) => state.notifications);
    const dispatch = useDispatch();

    const handleMarkRead = (id) => {
        dispatch(markRead(id));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-primary-600 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-20 overflow-hidden">
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                items.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-primary-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-grow">
                                                <Link
                                                    to={notif.link || '#'}
                                                    onClick={() => setIsOpen(false)}
                                                    className="text-sm text-slate-700 block"
                                                >
                                                    {notif.message}
                                                </Link>
                                                <span className="text-[10px] text-slate-400 mt-1 block">
                                                    {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                            {!notif.read && (
                                                <button
                                                    onClick={() => handleMarkRead(notif._id)}
                                                    className="text-primary-500 hover:text-primary-700 p-1"
                                                    title="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {items.length > 0 && (
                            <div className="p-3 bg-slate-50 text-center">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs font-medium text-slate-500 hover:text-primary-600"
                                >
                                    View All Activity
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
