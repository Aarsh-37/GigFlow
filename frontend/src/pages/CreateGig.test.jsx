import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CreateGig from './CreateGig';
import api from '../utils/api'; // Mocking API calls
import { logout } from '../slices/authSlice'; // Mocking auth slice actions

// Mocking Redux store and actions
jest.mock('../store');
jest.mock('../slices/authSlice', () => ({
    logout: jest.fn(),
}));
jest.mock('../utils/api'); // Mocking API utility

const mockStore = configureStore([]);

describe('CreateGig Component', () => {
    let store;
    const mockApi = api;
    const mockUserId = 'testUserId';
    const mockUser = { _id: mockUserId, name: 'Test User', role: 'client' }; // Mock user info

    beforeEach(() => {
        jest.clearAllMocks();

        store = mockStore({
            auth: { userInfo: mockUser },
            // Mocking gig slice if it controls state like loading/error for form submission
            gig: { loading: false, error: null },
        });

        // Mock API calls
        mockApi.post.mockResolvedValue({ data: { message: 'Gig created successfully' } });
        mockApi.get.mockResolvedValue({ data: { _id: 'mockGigId', ...mockGigData } }); // For edit mode if applicable
    });

    const mockGigData = { // Sample data for editing a gig
        title: 'Existing Gig Title',
        description: 'Existing description',
        budget: 3000,
        bidDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Format for input
        category: 'Development',
        tags: ['React', 'Node'],
        attachments: [],
    };

    const renderComponent = (initialEntries = ['/gigs/create']) => {
        render(
            <Provider store={store}>
                <Router initialEntries={initialEntries}>
                    <Routes>
                        <Route path="/gigs/create" element={<CreateGig />} />
                        {/* Add a route for successful creation redirection if needed */}
                        <Route path="/" element={<div>Landing Page</div>} />
                    </Routes>
                </Router>
            </Provider>
        );
    };

    it('renders the form with empty fields', () => {
        renderComponent();
        expect(screen.getByLabelText(/Gig Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Budget/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Bid Deadline/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
        expect(screen.getByText(/Tags/i)).toBeInTheDocument(); // Assuming tags are rendered
        expect(screen.getByText(/Attachments/i)).toBeInTheDocument(); // Assuming attachments input
        expect(screen.getByRole('button', { name: /Create Gig/i })).toBeInTheDocument();
    });

    it('allows filling out the form fields', () => {
        renderComponent();
        const titleInput = screen.getByLabelText(/Gig Title/i);
        const descriptionInput = screen.getByLabelText(/Description/i);
        const budgetInput = screen.getByLabelText(/Budget/i);
        const deadlineInput = screen.getByLabelText(/Bid Deadline/i);
        const categorySelect = screen.getByLabelText(/Category/i);

        fireEvent.change(titleInput, { target: { value: 'New Gig Title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Detailed description...' } });
        fireEvent.change(budgetInput, { target: { value: '2500' } });
        fireEvent.change(deadlineInput, { target: { value: '2024-12-31' } });
        fireEvent.change(categorySelect, { target: { value: 'Design' } });

        expect(titleInput).toHaveValue('New Gig Title');
        expect(descriptionInput).toHaveValue('Detailed description...');
        expect(budgetInput).toHaveValue('2500');
        expect(deadlineInput).toHaveValue('2024-12-31');
        expect(categorySelect).toHaveValue('Design');
    });

    it('handles tag selection', async () => {
        renderComponent();
        // Assuming there are buttons or similar for tag selection
        // Example: find a tag button and click it
        const tagButton = screen.getByText('React'); // Replace with actual tag element if different
        fireEvent.click(tagButton);

        // Check if the tag is visually selected or added to a list
        // This test would depend on the exact UI implementation for tag selection
        // For now, checking the click event is a basic validation.
        await waitFor(() => {
            // Add specific assertion if tag selection updates state or UI
            expect(tagButton).toHaveClass('bg-primary-100'); // Example assertion if selected style is applied
        });
    });

    it('submits the form successfully', async () => {
        renderComponent();

        // Fill form
        fireEvent.change(screen.getByLabelText(/Gig Title/i), { target: { value: 'Test Gig Creation' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A gig for testing.' } });
        fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '1200' } });
        fireEvent.change(screen.getByLabelText(/Bid Deadline/i), { target: { value: '2024-08-15' } });
        fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Development' } });

        // Click submit button
        fireEvent.click(screen.getByRole('button', { name: /Create Gig/i }));

        await waitFor(() => {
            expect(mockApi.post).toHaveBeenCalledWith('/gigs', expect.objectContaining({
                title: 'Test Gig Creation',
                description: 'A gig for testing.',
                budget: 1200,
                bidDeadline: '2024-08-15',
                category: 'Development',
            }));
            expect(toast.success).toHaveBeenCalledWith('Gig created successfully!');
            // Check for navigation if implemented
            // expect(navigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('shows error message on failed submission', async () => {
        mockApi.post.mockRejectedValue({ response: { data: { message: 'Failed to create gig' } } });

        renderComponent();

        // Fill form
        fireEvent.change(screen.getByLabelText(/Gig Title/i), { target: { value: 'Test Gig Creation' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A gig for testing.' } });
        fireEvent.change(screen.getByLabelText(/Budget/i), { target: { value: '1200' } });
        fireEvent.change(screen.getByLabelText(/Bid Deadline/i), { target: { value: '2024-08-15' } });
        fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Development' } });

        fireEvent.click(screen.getByRole('button', { name: /Create Gig/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to create gig');
            expect(screen.getByRole('button', { name: /Create Gig/i })).toBeInTheDocument(); // Button should still be there
        });
    });

    it('validates required fields', async () => {
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: /Create Gig/i }));

        await waitFor(() => {
            expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Description is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Budget must be a positive number/i)).toBeInTheDocument();
        });
    });

    // Test Edit Gig functionality (if applicable through URL parameters)
    describe('Edit Gig Mode', () => {
        it('pre-fills form fields when editing an existing gig', async () => {
            // Mock API call to fetch gig data for editing
            mockApi.get.mockResolvedValue({ data: mockGigData });

            renderComponent([`/gigs/edit/${mockGigData._id}`]); // Navigate to edit route

            await waitFor(() => {
                expect(screen.getByLabelText(/Gig Title/i)).toHaveValue(mockGigData.title);
                expect(screen.getByLabelText(/Description/i)).toHaveValue(mockGigData.description);
                expect(screen.getByLabelText(/Budget/i)).toHaveValue(mockGigData.budget.toString());
                // Deadline date format might need adjustment for exact match comparison
                expect(screen.getByLabelText(/Bid Deadline/i)).toHaveValue(mockGigData.bidDeadline.split('T')[0]);
                expect(screen.getByLabelText(/Category/i)).toHaveValue(mockGigData.category);
                // Tag selection would need more complex assertions
            });

            expect(screen.getByRole('button', { name: /Update Gig/i })).toBeInTheDocument(); // Check for update button text
        });

        it('updates gig when form is submitted in edit mode', async () => {
            mockApi.get.mockResolvedValue({ data: mockGigData }); // Mock fetch for edit
            mockApi.put.mockResolvedValue({ data: { ...mockGigData, title: 'Updated Gig Title' } }); // Mock update API

            renderComponent([`/gigs/edit/${mockGigData._id}`]);

            // Change a field
            fireEvent.change(screen.getByLabelText(/Gig Title/i), { target: { value: 'Updated Gig Title' } });

            // Submit update
            fireEvent.click(screen.getByRole('button', { name: /Update Gig/i }));

            await waitFor(() => {
                expect(mockApi.put).toHaveBeenCalledWith(`/gigs/${mockGigData._id}`, expect.objectContaining({ title: 'Updated Gig Title' }));
                expect(toast.success).toHaveBeenCalledWith('Gig updated successfully!');
                // Check for navigation if implemented
                // expect(navigate).toHaveBeenCalledWith('/dashboard');
            });
        });
    });
});
