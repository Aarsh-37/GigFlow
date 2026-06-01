import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice'; // Import themeReducer

const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer, // Add themeReducer
    },
});

export default store;
