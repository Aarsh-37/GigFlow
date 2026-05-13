import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchGigs = createAsyncThunk(
    'gigs/fetchGigs',
    async (params, { rejectWithValue }) => {
        try {
            const { data } = await api.get('/gigs', { params });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteGig = createAsyncThunk(
    'gigs/deleteGig',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/gigs/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    gigs: [],
    loading: false,
    error: null,
    // Pagination state
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    totalGigs: 0,
    // Search/filter state
    searchQuery: '',
    selectedCategory: '',
    selectedTags: [],
};

const gigSlice = createSlice({
    name: 'gigs',
    initialState,
    reducers: {
        setSearchQuery(state, action) {
            state.searchQuery = action.payload;
            state.currentPage = 1;
        },
        setSelectedCategory(state, action) {
            state.selectedCategory = action.payload;
            state.currentPage = 1;
        },
        setSelectedTags(state, action) {
            state.selectedTags = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage(state, action) {
            state.currentPage = action.payload;
        },
        resetFilters(state) {
            state.searchQuery = '';
            state.selectedCategory = '';
            state.selectedTags = [];
            state.currentPage = 1;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGigs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGigs.fulfilled, (state, action) => {
                state.loading = false;
                state.gigs = action.payload.gigs || action.payload || [];
                state.totalPages = action.payload.totalPages || 1;
                state.totalGigs = action.payload.totalGigs || state.gigs.length;
            })
            .addCase(fetchGigs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteGig.fulfilled, (state, action) => {
                state.gigs = state.gigs.filter((gig) => gig._id !== action.payload);
                state.totalGigs -= 1;
            });
    }
});

export const { setSearchQuery, setSelectedCategory, setSelectedTags, setCurrentPage, resetFilters } = gigSlice.actions;

export default gigSlice.reducer;
