import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import gigReducer from './slices/gigSlice'; // Import gigReducer
import bidReducer from './slices/bidSlice'; // Import bidReducer
import profileReducer from './slices/profileSlice'; // Import profileReducer

const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationReducer,
        gigs: gigReducer, // Add gigReducer
        bids: bidReducer, // Add bidReducer
        profile: profileReducer, // Add profileReducer
    },
});

export default store;
