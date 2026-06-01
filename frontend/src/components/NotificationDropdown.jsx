import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { data: notifications = [], isLoading, isError } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return data;
        },
        enabled: !!userInfo,
    });

    const markReadMutation = useMutation({
        mutationFn: (id) => api.patch(`/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

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

    const handleMarkAllRead = () => {
        notifications.forEach(n => {
            if (!n.isRead) markReadMutation.mutate(n._id);
        });
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markReadMutation.mutate(notification._id);
        }
        setIsOpen(false);
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-slate-400 hover:text-indigo-600 transition-colors relative"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications ({unreadCount} new)</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">Mark all read</button>
                        )}
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-gray-700">
                        {isLoading ? (
                            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={24} /></div>
                        ) : isError ? (
                            <div className="p-4 text-center text-red-500 text-xs">Failed to load updates.</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-xs font-bold">No notifications yet.</div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors ${!notification.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/5' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <p className={`text-xs ${!notification.isRead ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-400'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
