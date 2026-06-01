import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import GigDetail from './GigDetail';
import api from '../../../utils/api'; // Mocking API calls
import { logout } from '../../../slices/authSlice'; // Mocking auth slice actions
import * as lucideReact from 'lucide-react'; // Mocking lucide-react icons

// Mocking Redux store and actions
jest.mock('../store');
jest.mock('../slices/authSlice', () => ({
    logout: jest.fn(),
}));
// Mocking API utility
jest.mock('../utils/api');

// Mocking lucide-react icons to avoid issues with them in tests
jest.mock('lucide-react', () => ({
    ArrowLeft: () => <svg data-testid="ArrowLeft"></svg>,
    IndianRupee: () => <svg data-testid="IndianRupee"></svg>,
    Calendar: () => <svg data-testid="Calendar"></svg>,
    User: () => <svg data-testid="User"></svg>,
    CheckCircle: () => <svg data-testid="CheckCircle"></svg>,
    XCircle: () => <svg data-testid="XCircle"></svg>,
    Clock: () => <svg data-testid="Clock"></svg>,
}));


const mockStore = configureStore([]);

describe('GigDetail Component', () => {
    let store;
    const mockApi = api;
    const gigId = 'testGigId';

    const mockGig = {
        _id: gigId,
        title: 'Awesome React Gig',
        description: 'Detailed description for the gig.',
        budget: 5000,
        ownerId: { _id: 'ownerId', name: 'Gig Owner', email: 'owner@example.com' },
        status: 'open',
        createdAt: new Date().toISOString(),
        bidDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    const mockGigOwnerInfo = {
        _id: 'ownerId',
        name: 'Gig Owner',
        role: 'client',
    };

    const mockFreelancerInfo = {
        _id: 'freelancerId',
        name: 'Test Freelancer',
        role: 'freelancer',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mocking toast and window confirm for interactive elements
        global.toast = { success: jest.fn(), error: jest.fn() };
        global.window.confirm = jest.fn();

        // Mock API calls
        mockApi.get.mockResolvedValue({ data: mockGig }); // For gig details
        // Mock API calls for bids, reviews, etc.
        mockApi.post.mockResolvedValue({ data: { message: 'Bid placed successfully' } });
        mockApi.patch.mockResolvedValue({ data: { message: 'Action successful' } });
        mockApi.delete.mockResolvedValue({ data: { message: 'Deleted successfully' } });
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore original implementations
    });

    it('renders loading state initially', () => {
        // Mock API to delay response to show skeleton
        mockApi.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: mockGig }), 100)));

        render(
            <Provider store={store}>
                <Router initialEntries={[`/gigs/${gigId}`]}>
                    <Routes>
                        <Route path="/gigs/:id" element={<GigDetail />} />
                    </Routes>
                </Router>
            </Provider>
        );

        expect(screen.getByText(/animate-pulse/i)).toBeInTheDocument(); // Check for skeleton element
    });

    it('displays error if gig is not found', async () => {
        mockApi.get.mockRejectedValue({ response: { data: { message: 'Gig not found' } } });

        render(
            <Provider store={store}>
                <Router initialEntries={[`/gigs/${gigId}`]}>
                    <Routes>
                        <Route path="/gigs/:id" element={<GigDetail />} />
                    </Routes>
                </Router>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Gig not found or error loading details/i)).toBeInTheDocument();
        });
    });

    it('renders gig details correctly for a logged-in freelancer', async () => {
        // Mock store with freelancer info
        const freelancerStore = mockStore({
            auth: { userInfo: mockFreelancerInfo },
            notifications: { unreadCount: 0 },
        });
        // Mock bids API response for freelancer view
        mockApi.get.mockResolvedValueOnce({ data: mockGig }); // Gig details
        mockApi.get.mockResolvedValueOnce({ data: [] }); // No bids fetched for freelancer directly here, fetched by owner or when placing bid
        mockApi.get.mockResolvedValueOnce({ data: false }); // Mock hasReviewed response


        render(
            <Provider store={freelancerStore}>
                <Router initialEntries={[`/gigs/${gigId}`]}>
                    <Routes>
                        <Route path="/gigs/:id" element={<GigDetail />} />
                    </Routes>
                </Router>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(mockGig.title)).toBeInTheDocument();
            expect(screen.getByText(/Posted by Gig Owner/i)).toBeInTheDocument();
            expect(screen.getByText(/Budget: ₹5,000/i)).toBeInTheDocument();
            expect(screen.getByText(mockGig.description)).toBeInTheDocument();

            // Check for Bid placement section
            expect(screen.getByText(/Place Your Bid/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Why are you the best fit for this job?/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/500/i)).toBeInTheDocument(); // Price input placeholder
        });
    });

    it('renders gig details correctly for the owner', async () => {
        // Mock store with owner info
        const ownerStore = mockStore({
            auth: { userInfo: mockGigOwnerInfo },
            notifications: { unreadCount: 0 },
        });
        // Mock bids API response for owner view
        const mockBids = [
            { _id: 'bid1', gigId: { _id: gigId, title: mockGig.title }, freelancerId: { _id: 'freelancerId', name: 'Test Freelancer', email: 'freelancer@example.com', role: 'freelancer', averageRating: 4.0, completedGigsCount: 5 }, message: 'Bid message', price: 4500, status: 'pending' },
            { _id: 'bid2', gigId: { _id: gigId, title: mockGig.title }, freelancerId: { _id: 'anotherFreelancerId', name: 'Another Freelancer', role: 'freelancer', averageRating: 4.2, completedGigsCount: 7 }, message: 'Another bid', price: 4600, status: 'hired' },
        ];
        mockApi.get.mockResolvedValueOnce({ data: mockGig }); // Gig details
        mockApi.get.mockResolvedValueOnce({ data: mockBids }); // Bids for the gig
        mockApi.get.mockResolvedValueOnce({ data: false }); // Mock hasReviewed response


        render(
            <Provider store={ownerStore}>
                <Router initialEntries={[`/gigs/${gigId}`]}>
                    <Routes>
                        <Route path="/gigs/:id" element={<GigDetail />} />
                    </Routes>
                </Router>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(mockGig.title)).toBeInTheDocument();
            // Check for Bids Management section
            expect(screen.getByText(/Received Bids \(2\)/i)).toBeInTheDocument();
            expect(screen.getByText(/Test Freelancer/i)).toBeInTheDocument();
            expect(screen.getByText(/₹4,500/i)).toBeInTheDocument(); // Pending bid price
            expect(screen.getByText(/PENDING/i)).toBeInTheDocument();

            expect(screen.getByText(/Another Freelancer/i)).toBeInTheDocument();
            expect(screen.getByText(/₹4,600/i)).toBeInTheDocument(); // Hired bid price
            expect(screen.getByText(/HIRED/i)).toBeInTheDocument();
            expect(screen.getByText(/Hire Now/i)).toBeInTheDocument(); // Hire button should be present
        });
    });

    it('handles placing a bid', async () => {
        const freelancerStore = mockStore({ auth: { userInfo: mockFreelancerInfo } });
        // Mock API responses for placing bid and potentially notification
        mockApi.post.mockResolvedValue({ data: { message: 'Bid placed successfully', notificationData: { message: 'New bid!' } } });
        mockApi.get.mockResolvedValueOnce({ data: mockGig }); // Gig details
        mockApi.get.mockResolvedValueOnce({ data: [] }); // Bids (empty initially for freelancer)
        mockApi.get.mockResolvedValueOnce({ data: false }); // hasReviewed

        render(
            <Provider store={freelancerStore}>
                <Router initialEntries={[`/gigs/${gigId}`]}>
                    <Routes>
                        <Route path="/gigs/:id" element={<GigDetail />} />
                    </Routes>
                </Router>
            </Provider>
        );

        await waitFor(() => {
            // Fill out bid form
            fireEvent.change(screen.getByPlaceholderText(/Why are you the best fit for this job?/i), { target: { value: 'My amazing skills' } });
            fireEvent.change(screen.getByPlaceholderText(/500/i), { target: { value: '4800' } });

            // Submit bid
            fireEvent.click(screen.getByRole('button', { name: /Submit Proposal/i }));
        });

        await waitFor(() => {
            expect(mockApi.post).toHaveBeenCalledWith('/bids', expect.objectContaining({
                gigId: gigId,
                message: 'My amazing skills',
                price: 4800,
            }));
            expect(toast.success).toHaveBeenCalledWith('Bid placed successfully!');
            expect(screen.getByText(/Bid Submitted Successfully!/i)).toBeInTheDocument();
        });
    });

    it('handles hiring a freelancer', async () => {
        const ownerStore = mockStore({ auth: { userInfo: mockGigOwnerInfo } });
        const mockBids = [
            { _id: 'bid1', gigId: { _id: gigId, title: mockGig.title }, freelancerId: { _id: 'freelancerId', name: 'Test Freelancer', role: 'freelancer', averageRating: 4.0, completedGigsCount: 5 }, message: 'Bid message', price: 4500, status: 'pending' },
        ];
        mockApi.get.mockResolvedValueOnce({ data: { ...mockGig, status: 'assigned' } }); // Gig status becomes assigned after hire
        mockApi.get.mockResolvedValueOnce({ data: mockBids }); // Bids for the gig
        mockApi.get.mockResolvedValueOnce({ data: false }); // hasReviewed

        // Mock window.confirm to return true for hiring
        jest.spyOn(window, 'confirm').mockImplementation(() => true);

        render(
            <Provider store={ownerStore}>
                <Router initialEntries={[`/gigs/${gigId}`]}>
                    <Routes>
                        <Route path="/gigs/:id" element={<GigDetail />} />
                    </Routes>
                </Router>
            </Provider>
        );

        await waitFor(() => {
            const hireButton = screen.getByRole('button', { name: /Hire Now/i });
            fireEvent.click(hireButton);
        });

        await waitFor(() => {
            expect(mockApi.patch).toHaveBeenCalledWith('/api/bids/bid1/hire');
            expect(toast.success).toHaveBeenCalledWith('Freelancer hired successfully!');
            // Check if UI updates to reflect hiring (e.g., status changes, hire button disappears)
            expect(screen.queryByRole('button', { name: /Hire Now/i })).not.toBeInTheDocument();
        });
    });

    it('handles gig status transitions (start, complete, close)', async () => {
        const ownerStore = mockStore({ auth: { userInfo: mockGigOwnerInfo } });
        // Setup initial state for transitions
        mockApi.get.mockResolvedValueOnce({ data: { ...mockGig, status: 'assigned' } }); // For gig details
        mockApi.get.mockResolvedValueOnce({ data: [{ _id: 'bid1', gigId: { _id: gigId, title: mockGig.title }, freelancerId: { _id: 'freelancerId', name: 'Test Freelancer' }, message: 'Bid', price: 4500, status: 'hired' }] }); // For bids
        mockApi.get.mockResolvedValueOnce({ data: false }); // hasReviewed

        render(
            <Provider store={ownerStore}>
                <Router initialEntries={[`/gigs/${gigId}`]}>
                    <Routes>
                        <Route path="/gigs/:id" element={<GigDetail />} />
                    </Routes>
                </Router>
            </Provider>
        );

        // Test Starting Gig
        await waitFor(() => {
            const startButton = screen.getByRole('button', { name: /Start Project/i });
            expect(startButton).toBeInTheDocument();
            fireEvent.click(startButton);
        });
        await waitFor(() => {
            expect(mockApi.patch).toHaveBeenCalledWith(`/api/gigs/${gigId}/start`);
            expect(toast.success).toHaveBeenCalledWith('Gig status updated to "start"!'); // Assuming toast message format
        });

        // Test Completing Gig
        await waitFor(() => {
            const completeButton = screen.getByRole('button', { name: /Mark as Completed/i });
            expect(completeButton).toBeInTheDocument();
            fireEvent.click(completeButton);
        });
        await waitFor(() => {
            expect(mockApi.patch).toHaveBeenCalledWith(`/api/gigs/${gigId}/complete`);
            expect(toast.success).toHaveBeenCalledWith('Gig status updated to "complete"!');
        });

        // Test Closing Gig (Release Payment) - requires checking balance updates if implemented, or just status
        await waitFor(() => {
            const closeButton = screen.getByRole('button', { name: /Confirm Completion & Release Payment/i });
            expect(closeButton).toBeInTheDocument();
            fireEvent.click(closeButton);
        });
        await waitFor(() => {
            expect(mockApi.patch).toHaveBeenCalledWith(`/api/gigs/${gigId}/close`);
            expect(toast.success).toHaveBeenCalledWith('Gig status updated to "close"!');
        });
    });

    it('handles review submission', async () => {
        const ownerStore = mockStore({ auth: { userInfo: mockGigOwnerInfo } });
        // Mock gig completion and review submission
        mockApi.get.mockResolvedValueOnce({ data: { ...mockGig, status: 'completed' } }); // Gig completed
        mockApi.get.mockResolvedValueOnce({ data: [{ _id: 'bid1', gigId: { _id: gigId, title: mockGig.title }, freelancerId: { _id: 'freelancerId', name: 'Test Freelancer' }, message: 'Bid', price: 4500, status: 'hired' }] }); // Hired bid
        mockApi.get.mockResolvedValueOnce({ data: false }); // hasReviewed initially false

        // Mock POST /reviews call
        mockApi.post.mockResolvedValue({ data: { message: 'Review submitted!' } });

        render(
            <Provider store={ownerStore}>
                <Router initialEntries={[`/gigs/${gigId}`]}>
                    <Routes>
                        <Route path="/gigs/:id" element={<GigDetail />} />
                    </Routes>
                </Router>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Feedback & Reviews/i)).toBeInTheDocument();
            // Select rating (e.g., click 4th star)
            const starButtons = screen.getAllByTestId('Star'); // Assuming Star icons have data-testid="Star"
            fireEvent.click(starButtons[3]); // Click 4th star (index 3)

            fireEvent.change(screen.getByPlaceholderText(/Share your experience/i), { target: { value: 'Great experience!' } });
            fireEvent.click(screen.getByRole('button', { name: /Submit Review/i }));
        });

        await waitFor(() => {
            expect(mockApi.post).toHaveBeenCalledWith('/reviews', expect.objectContaining({
                gigId: gigId,
                revieweeId: 'freelancerId', // Correct reviewee ID
                rating: 4, // Rating based on clicked star
                comment: 'Great experience!',
            }));
            expect(toast.success).toHaveBeenCalledWith('Review submitted!');
            // Check if review form is no longer accessible or marked as reviewed
        });
    });

    // Test redirection for logged-in user on landing page (if applicable)
    // Test handling of different gig statuses (e.g., assigned, in-progress)
});
