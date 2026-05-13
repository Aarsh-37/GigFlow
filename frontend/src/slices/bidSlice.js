import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    bids: [], // List of bids for a specific gig, or user's submitted bids
    loading: false,
    error: null,
    // Could add pagination for bids if needed
};

const bidSlice = createSlice({
    name: 'bids',
    initialState,
    reducers: {
        // Action to set bids
        setBids(state, action) {
            state.bids = action.payload;
            state.loading = false;
            state.error = null;
        },
        // Action to add a new bid (e.g., when a freelancer submits one)
        addBid(state, action) {
            state.bids.push(action.payload);
            state.loading = false;
            state.error = null;
        },
        // Action to update a bid status (e.g., hired, rejected)
        updateBid(state, action) {
            const index = state.bids.findIndex(bid => bid._id === action.payload._id);
            if (index !== -1) {
                state.bids[index] = action.payload;
            }
            state.loading = false;
            state.error = null;
        },
        // Action to remove a bid (e.g., withdrawal)
        removeBid(state, action) {
            state.bids = state.bids.filter(bid => bid._id !== action.payload);
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
        },
        // Action to clear bids
        clearBids(state) {
            state.bids = [];
            state.loading = false;
            state.error = null;
        }
    },
});

export const { setBids, addBid, updateBid, removeBid, setLoading, setError, clearBids } = bidSlice.actions;

export default bidSlice.reducer;
