import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
<<<<<<< HEAD
import notificationReducer from './slices/notificationSlice';
=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f

const store = configureStore({
    reducer: {
        auth: authReducer,
<<<<<<< HEAD
        notifications: notificationReducer,
=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
    },
});

export default store;
