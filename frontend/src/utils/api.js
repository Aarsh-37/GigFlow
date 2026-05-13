import axios from 'axios';
import store from '../store'; // Assuming store is in ../store
import { logout } from '../slices/authSlice'; // Assuming logout action is in ../slices/authSlice
import { toast } from 'react-hot-toast'; // Import toast for error notifications

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Use local URL by default
    withCredentials: true,
});

// Axios response interceptor for centralized error handling
api.interceptors.response.use(
    (response) => {
        // If the response is successful, just return it
        return response;
    },
    (error) => {
        // Handle errors
        if (error.response && error.response.status === 401) {
            // If unauthorized (e.g., token expired), log out the user and redirect to login
            store.dispatch(logout());
            // Redirect to login page. Using window.location to force a full page reload
            // to clear any lingering state and ensure a clean navigation to login.
            window.location.href = '/login';
        } else {
            // For other errors, display a generic message and then reject the promise
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
            toast.error(errorMessage);
            return Promise.reject(error);
        }
    }
);

export default api;