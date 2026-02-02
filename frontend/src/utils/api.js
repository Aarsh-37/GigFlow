import axios from 'axios';

const api = axios.create({

<<<<<<< HEAD
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
=======
    // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    baseURL: 'https://gigflow-backend-xlsy.onrender.com/api',
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
    withCredentials: true,
});

export default api;
