import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunk for fetching gigs with filters (search, category, tags)
export const fetchGigs = createAsyncThunk(
    'gigs/fetchGigs',
    async ({ page = 1, limit = 12, search = '', category = '', tags = [] }, { rejectWithValue }) => {
        try {
            const response = await api.get('/gigs', {
                params: {
                    page,
                    limit,
                    search,
                    category,
                    tags: tags.join(',') // Pass tags as a comma-separated string
                }
            });
            return response.data; // Expected response: { gigs, page, limit, totalPages, totalGigs }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch gigs');
        }
    }
);

// Async thunk for fetching a single gig detail
export const fetchGigById = createAsyncThunk(
    'gigs/fetchGigById',
    async (gigId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/gigs/${gigId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch gig details');
        }
    }
);

const initialState = {
    gigs: [],
    currentGig: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    currentPage: 1,
    limit: 12,
    totalPages: 0,
    totalGigs: 0,
    searchQuery: '',
    selectedCategory: '',
    selectedTags: [],
};

const gigSlice = createSlice({
    name: 'gigs',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.currentPage = 1; // Reset to first page on new search
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
            state.currentPage = 1; // Reset to first page on category change
        },
        setSelectedTags: (state, action) => {
            state.selectedTags = action.payload;
            state.currentPage = 1; // Reset to first page on tag change
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        // Reducer to reset filters when needed, e.g., when navigating away from filter page
        resetFilters: (state) => {
            state.searchQuery = '';
            state.selectedCategory = '';
            state.selectedTags = [];
            state.currentPage = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Gigs
            .addCase(fetchGigs.pending, (state) => {
                state.status = 'loading';
                state.error = null; // Clear previous errors on new fetch
            })
            .addCase(fetchGigs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gigs = action.payload.gigs;
                state.currentPage = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
                state.totalGigs = action.payload.totalGigs;
            })
            .addCase(fetchGigs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch Gig by ID
            .addCase(fetchGigById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.currentGig = null; // Clear previous gig details
            })
            .addCase(fetchGigById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentGig = action.payload;
            })
            .addCase(fetchGigById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { setSearchQuery, setSelectedCategory, setSelectedTags, setCurrentPage, resetFilters } = gigSlice.actions;
export default gigSlice.reducer;
