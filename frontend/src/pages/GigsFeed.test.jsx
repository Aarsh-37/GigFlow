import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'; // For mocking Redux store
import GigsFeed from './GigsFeed';
import api from '../utils/api'; // Mocking API calls

// Mocking the API module
jest.mock('../utils/api');
// Mocking Redux slices and actions if they are directly used for data fetching logic
jest.mock('../slices/gigSlice', () => ({
    // Mock actions if they are dispatched directly and need testing
}));
// Mocking store and RTK Query hooks if used
jest.mock('../store', () => ({
    // Mock store setup or specific parts if needed
    getState: jest.fn(),
    dispatch: jest.fn(),
}));

const mockStore = configureStore([]);

describe('GigsFeed Component', () => {
    let store;
    const mockApi = api; // Use the mocked API

    beforeEach(() => {
        // Reset mocks and store before each test
        jest.clearAllMocks();
        store = mockStore({
            auth: { userInfo: { _id: 'testUserId', role: 'freelancer' } }, // Mock logged-in user
            gig: {
                gigs: [],
                loading: false,
                error: null,
                page: 1,
                totalPages: 0,
                totalGigs: 0,
                searchKeyword: '',
                selectedCategory: '',
                selectedTags: [],
            },
            // Add other slices if necessary
        });

        // Mocking the fetchGigs thunk or direct API calls if not using thunks in component
        // For this example, assume GigsFeed dispatches fetchGigs from gigSlice directly
        // Or makes direct API calls. Let's mock direct API calls for simplicity here.
        mockApi.get.mockResolvedValue({ data: { gigs: [], page: 1, totalPages: 1, totalGigs: 0 } });
    });

    it('renders without crashing', () => {
        render(
            <Provider store={store}>
                <Router>
                    <GigsFeed />
                </Router>
            </Provider>
        );
        expect(screen.getByText(/GigFlow Gigs/i)).toBeInTheDocument();
    });

    it('displays loading state initially', async () => {
        // Mock API call to simulate loading
        mockApi.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: { gigs: [], page: 1, totalPages: 1, totalGigs: 0 } }), 50)));

        render(
            <Provider store={store}>
                <Router>
                    <GigsFeed />
                </Router>
            </Provider>
        );

        expect(screen.getByText(/Loading gigs.../i)).toBeInTheDocument();
        // Wait for loading to finish and check if it's gone
        await waitFor(() => expect(screen.queryByText(/Loading gigs.../i)).not.toBeInTheDocument());
    });

    it('displays gigs when fetched successfully', async () => {
        const mockGigs = [
            { _id: '1', title: 'Gig 1', description: 'Desc 1', budget: 1000, status: 'open', ownerId: { name: 'Owner 1' }, createdAt: new Date().toISOString() },
            { _id: '2', title: 'Gig 2', description: 'Desc 2', budget: 2000, status: 'open', ownerId: { name: 'Owner 2' }, createdAt: new Date().toISOString() },
        ];
        mockApi.get.mockResolvedValueOnce({ data: { gigs: mockGigs, page: 1, totalPages: 1, totalGigs: 2 } });

        render(
            <Provider store={store}>
                <Router>
                    <GigsFeed />
                </Router>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Gig 1/i)).toBeInTheDocument();
            expect(screen.getByText(/Gig 2/i)).toBeInTheDocument();
            expect(screen.getByText(/Owner 1/i)).toBeInTheDocument();
        });
    });

    it('displays message when no gigs are found', async () => {
        mockApi.get.mockResolvedValue({ data: { gigs: [], page: 1, totalPages: 0, totalGigs: 0 } });

        render(
            <Provider store={store}>
                <Router>
                    <GigsFeed />
                </Router>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/No gigs found matching your criteria/i)).toBeInTheDocument();
        });
    });

    it('handles search input and updates gigs', async () => {
        const mockGigs = [{ _id: '1', title: 'React Dev Gig', description: 'Desc', budget: 1000, status: 'open', ownerId: { name: 'Owner' }, createdAt: new Date().toISOString() }];
        mockApi.get.mockResolvedValue({ data: { gigs: mockGigs, page: 1, totalPages: 1, totalGigs: 1 } });

        render(
            <Provider store={store}>
                <Router>
                    <GigsFeed />
                </Router>
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText(/Search for gigs/i);
        fireEvent.change(searchInput, { target: { value: 'React' } });
        // Simulating debounce or submit logic if it exists; for simplicity, assume fetch is triggered

        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('search=React'));
            expect(screen.getByText(/React Dev Gig/i)).toBeInTheDocument();
        });
    });

    it('handles category filtering', async () => {
        const mockGigs = [{ _id: '1', title: 'Design Gig', description: 'Desc', budget: 1000, status: 'open', category: 'Design', ownerId: { name: 'Owner' }, createdAt: new Date().toISOString() }];
        mockApi.get.mockResolvedValue({ data: { gigs: mockGigs, page: 1, totalPages: 1, totalGigs: 1 } });

        render(
            <Provider store={store}>
                <Router>
                    <GigsFeed />
                </Router>
            </Provider>
        );

        // Simulate opening filter and selecting a category
        const filterButton = screen.getByRole('button', { name: /filter/i });
        fireEvent.click(filterButton);

        const categorySelect = screen.getByLabelText(/category/i);
        fireEvent.change(categorySelect, { target: { value: 'Design' } });

        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('category=Design'));
            expect(screen.getByText(/Design Gig/i)).toBeInTheDocument();
        });
    });

    it('handles tag filtering', async () => {
        const mockGigs = [{ _id: '1', title: 'React JS Gig', description: 'Desc', budget: 1000, status: 'open', tags: ['React', 'JavaScript'], ownerId: { name: 'Owner' }, createdAt: new Date().toISOString() }];
        mockApi.get.mockResolvedValue({ data: { gigs: mockGigs, page: 1, totalPages: 1, totalGigs: 1 } });

        render(
            <Provider store={store}>
                <Router>
                    <GigsFeed />
                </Router>
            </Provider>
        );

        // Simulate opening filter and clicking a tag
        const filterButton = screen.getByRole('button', { name: /filter/i });
        fireEvent.click(filterButton);

        const reactTagButton = screen.getByRole('button', { name: 'React' });
        fireEvent.click(reactTagButton);

        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('tags=React'));
            expect(screen.getByText(/React JS Gig/i)).toBeInTheDocument();
        });
    });

    it('handles pagination clicks', async () => {
        const mockGigsPage1 = [{ _id: '1', title: 'Gig Page 1', description: 'Desc', budget: 1000, status: 'open', ownerId: { name: 'Owner' }, createdAt: new Date().toISOString() }];
        const mockGigsPage2 = [{ _id: '2', title: 'Gig Page 2', description: 'Desc', budget: 1500, status: 'open', ownerId: { name: 'Owner' }, createdAt: new Date().toISOString() }];

        mockApi.get.mockResolvedValueOnce({ data: { gigs: mockGigsPage1, page: 1, totalPages: 2, totalGigs: 2 } }); // First call for page 1

        render(
            <Provider store={store}>
                <Router>
                    <GigsFeed />
                </Router>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Gig Page 1/i)).toBeInTheDocument();
        });

        // Mock the second API call for page 2
        mockApi.get.mockResolvedValueOnce({ data: { gigs: mockGigsPage2, page: 2, totalPages: 2, totalGigs: 2 } });

        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
            expect(screen.getByText(/Gig Page 2/i)).toBeInTheDocument();
        });
    });
});
