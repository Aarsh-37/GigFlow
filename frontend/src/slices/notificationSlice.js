import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/notifications');
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const markRead = createAsyncThunk(
    'notifications/markRead',
    async (id, { rejectWithValue }) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    notifications: [], // Array to store notifications
    unreadCount: 0,   // Count of unread notifications
    loading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Action to add a single notification
        addNotification(state, action) {
            state.notifications.unshift(action.payload); // Add new notification to the beginning
            state.unreadCount += 1;
            state.loading = false;
            state.error = null;
        },
        // Action to add multiple notifications (e.g., on initial load)
        setNotifications(state, action) {
            state.notifications = action.payload.notifications;
            state.unreadCount = action.payload.unreadCount || 0; // Ensure unreadCount is set or defaults to 0
            state.loading = false;
            state.error = null;
        },
        // Action to mark notifications as read
        markAsRead(state) {
            state.notifications.forEach(notification => {
                notification.isRead = true;
            });
            state.unreadCount = 0; // Reset unread count
        },
        // Action to mark a single notification as read
        markNotificationAsRead(state, action) {
            const notificationId = action.payload;
            const notificationIndex = state.notifications.findIndex(n => n._id === notificationId);
            if (notificationIndex !== -1 && !state.notifications[notificationIndex].isRead) {
                state.notifications[notificationIndex].isRead = true;
                state.unreadCount -= 1;
            }
        },
        // Action to remove a single notification by ID
        removeNotification(state, action) {
            const id = action.payload;
            const notification = state.notifications.find(n => n._id === id);
            if (notification && !notification.read && !notification.isRead) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications = state.notifications.filter(n => n._id !== id);
        },
        // Action to clear all notifications
        clearNotifications(state) {
            state.notifications = [];
            state.unreadCount = 0;
            state.loading = false;
            state.error = null;
        },
        // Action to set loading state
        setLoading(state) {
            state.loading = true;
            state.error = null;
        },
        // Action to set error state
        setError(state, action) {
            state.loading = false;
            state.error = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications || action.payload || [];
                state.unreadCount = action.payload.unreadCount || state.notifications.filter(n => !n.isRead && !n.read).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(markRead.fulfilled, (state, action) => {
                const id = action.payload;
                const notification = state.notifications.find(n => n._id === id);
                if (notification && !notification.isRead && !notification.read) {
                    notification.isRead = true;
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });
    }
});

export const {
    addNotification,
    setNotifications,
    markAsRead,
    markNotificationAsRead,
    removeNotification,
    clearNotifications,
    setLoading,
    setError
} = notificationSlice.actions;

export default notificationSlice.reducer;
