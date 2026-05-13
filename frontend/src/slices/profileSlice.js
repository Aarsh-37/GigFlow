import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunk for fetching user profile details
export const fetchUserProfile = createAsyncThunk(
    'profile/fetchUserProfile',
    async (userId, { rejectWithValue }) => {
        try {
            // Fetch user details from /api/users/:id endpoint
            const response = await api.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user profile');
        }
    }
);

// Async thunk for fetching gigs posted by a user
export const fetchUserGigs = createAsyncThunk(
    'profile/fetchUserGigs',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/users/${userId}/gigs`);
            return response.data; // Expected: array of gigs
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user gigs');
        }
    }
);

// Async thunk for fetching bids submitted by a user
export const fetchUserBids = createAsyncThunk(
    'profile/fetchUserBids',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/users/${userId}/bids`);
            return response.data; // Expected: array of bids
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user bids');
        }
    }
);

// Async thunk to withdraw a bid
export const withdrawBid = createAsyncThunk(
    'profile/withdrawBid',
    async (bidId, { rejectWithValue }) => {
        try {
            await api.delete(`/bids/${bidId}`);
            return bidId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to withdraw bid');
        }
    }
);

const initialState = {
    userProfile: null,
    userGigs: [],
    userBids: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        // Reducers for synchronous state updates if needed
        resetProfileState: (state) => {
            state.userProfile = null;
            state.userGigs = [];
            state.userBids = [];
            state.status = 'idle';
            state.error = null;
        },
        // Potentially reducers for updating profile locally before API call
    },
    extraReducers: (builder) => {
        builder
            // Fetch User Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userProfile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch User Gigs
            .addCase(fetchUserGigs.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserGigs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userGigs = action.payload;
            })
            .addCase(fetchUserGigs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch User Bids
            .addCase(fetchUserBids.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserBids.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userBids = action.payload;
            })
            .addCase(fetchUserBids.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Withdraw Bid
            .addCase(withdrawBid.fulfilled, (state, action) => {
                state.userBids = state.userBids.filter(bid => bid._id !== action.payload);
            });
    }
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
