import axios from 'axios';
import store from '../store';
import { logout } from '../slices/authSlice';
import { toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding tokens if needed (though we use cookies)
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for centralized error handling and data extraction
api.interceptors.response.use(
    (response) => {
        // Automatically extract the payload from our standardized backend response format
        // This ensures compatibility with axios destructuring: const { data } = await api.get(...)
        if (response.data && typeof response.data.success !== 'undefined') {
            return {
                ...response,
                data: response.data.data
            };
        }
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        
        if (error.response?.status === 401) {
            // Check if it's an auth route, if so, don't logout automatically to avoid infinite loops
            const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
            if (!isAuthRoute) {
                store.dispatch(logout());
                // Redirect to login only if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        // Only show toast for non-401 errors or specific auth errors
        if (error.response?.status !== 401 || error.config.url.includes('/auth/login')) {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;