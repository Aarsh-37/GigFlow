import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userInfo: null,
    isLoading: true, // New loading state to prevent flicker
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
        },
        setAuthLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        logout: (state) => {
            state.userInfo = null;
        },
    },
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;
