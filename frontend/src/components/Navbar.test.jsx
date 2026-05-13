import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Navbar from './Navbar';
import api from '../utils/api'; // Mocking API calls
import { logout } from '../slices/authSlice'; // Mocking auth slice actions

// Mocking Redux store and actions
jest.mock('../store');
jest.mock('../slices/authSlice', () => ({
    logout: jest.fn(),
}));
// Mocking NotificationDropdown to avoid issues with its internal implementation
jest.mock('./NotificationDropdown', () => () => <div data-testid="notification-dropdown"></div>);


const mockStore = configureStore([]);

describe('Navbar Component', () => {
    let store;
    const mockApi = api;

    const mockUserInfo = {
        _id: 'testUserId',
        name: 'Test User',
        email: 'test@example.com',
        role: 'freelancer',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        store = mockStore({
            auth: { userInfo: mockUserInfo },
            notifications: { unreadCount: 0 },
        });

        // Mock API calls
        mockApi.post.mockResolvedValue({ data: { message: 'Logged out successfully.' } });
    });

    it('renders correctly for logged-in user', () => {
        render(
            <Provider store={store}>
                <Router>
                    <Navbar />
                </Router>
            </Provider>
        );

        expect(screen.getByText(/GigFlow/i)).toBeInTheDocument();
        expect(screen.getByTitle(/Dashboard/i)).toBeInTheDocument();
        expect(screen.getByTitle(/Logout/i)).toBeInTheDocument();
        expect(screen.getByText(mockUserInfo.name.charAt(0))).toBeInTheDocument(); // Profile initial
        expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument(); // Check if NotificationDropdown is rendered
    });

    it('renders sign in and join buttons for logged-out user', () => {
        const loggedOutStore = mockStore({
            auth: { userInfo: null },
            notifications: { unreadCount: 0 },
        });

        render(
            <Provider store={loggedOutStore}>
                <Router>
                    <Navbar />
                </Router>
            </Provider>
        );

        expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
        expect(screen.getByText(/Join Now/i)).toBeInTheDocument();
        expect(screen.queryByTitle(/Logout/i)).not.toBeInTheDocument();
        expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument(); // Notification dropdown should not be rendered for logged out users
    });

    it('handles logout', async () => {
        render(
            <Provider store={store}>
                <Router>
                    <Navbar />
                </Router>
            </Provider>
        );

        const logoutButton = screen.getByTitle(/Logout/i);
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(mockApi.post).toHaveBeenCalledWith('/auth/logout');
            expect(logout).toHaveBeenCalledTimes(1);
        });
    });

    it('toggles mobile menu', () => {
        render(
            <Provider store={store}>
                <Router>
                    <Navbar />
                </Router>
            </Provider>
        );

        // Find the mobile menu button (hamburger icon)
        const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
        fireEvent.click(mobileMenuButton); // Opens menu

        // Check if mobile menu content is visible (e.g., close button or a nav link)
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();

        fireEvent.click(mobileMenuButton); // Closes menu
        expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    });

    it('closes mobile menu when clicking outside', async () => {
        render(
            <Provider store={store}>
                <Router>
                    <Navbar />
                </Router>
            </Provider>
        );

        // Open mobile menu
        const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
        fireEvent.click(mobileMenuButton);

        // Click outside the menu (e.g., on the document body or another element)
        // Mocking document.body might be complex, simpler to click on an element outside menu
        // For this test, assuming clicking anywhere outside the menu works, so we can use document.body.
        fireEvent.mouseDown(document.body);

        // Mobile menu should be closed
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
        });
    });

    it('closes mobile menu when a link is clicked', async () => {
        render(
            <Provider store={store}>
                <Router>
                    <Navbar />
                </Router>
            </Provider>
        );

        // Open mobile menu
        const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
        fireEvent.click(mobileMenuButton);

        // Click on a link inside the mobile menu (e.g., Dashboard)
        const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
        fireEvent.click(dashboardLink);

        // Mobile menu should be closed
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
        });
    });

    // Test Dark Mode Toggle
    it('toggles dark mode on button click', async () => {
        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
            },
            writable: true,
        });

        // Initial state: light mode
        localStorage.getItem.mockReturnValue('light');
        document.documentElement.classList.remove('dark'); // Ensure it's clean

        render(
            <Provider store={store}>
                <Router>
                    <Navbar />
                </Router>
            </Provider>
        );

        // Find the dark mode toggle button (sun/moon icon)
        const darkModeToggle = screen.getByRole('button', { name: /dark mode toggle/i }); // Assuming accessible name like "Toggle dark mode" or icon name

        // Click to toggle to dark mode
        fireEvent.click(darkModeToggle);
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);

        // Click again to toggle back to light mode
        fireEvent.click(darkModeToggle);
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('initializes dark mode based on localStorage', () => {
        // Mock localStorage for dark mode
        localStorage.getItem.mockReturnValue('dark');
        document.documentElement.classList.remove('dark'); // Ensure clean slate

        render(
            <Provider store={store}>
                <Router>
                    <Navbar />
                </Router>
            </Provider>
        );

        // Check if dark mode class was applied on initial render
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});
