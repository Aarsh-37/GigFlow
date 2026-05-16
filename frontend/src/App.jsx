import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import GigsFeed from './pages/GigsFeed';
import Dashboard from './pages/Dashboard';
import CreateGig from './pages/CreateGig';
import GigDetail from './pages/GigDetail';
import socket from './socket';
import { addNotification, fetchNotifications } from './slices/notificationSlice';
import { setCredentials } from './slices/authSlice';
import api from './utils/api';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import LandingPage from './pages/LandingPage'; // Import the LandingPage component
import ErrorBoundary from './components/common/ErrorBoundary';

const PrivateRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? children : <Navigate to="/login" />;
};

function App() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Initial session recovery - runs only once when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      // Only check if we don't have userInfo yet (bridging initial load)
      if (!userInfo) {
        try {
          const { data } = await api.get('/auth/me');
          dispatch(setCredentials(data));
        } catch (error) {
          // No active session or token expired
          console.error('No active session found'); // Changed to console.error
        }
      }
    };
    checkAuth();
  }, []); // Empty dependency array = run only on mount

  const { mode } = useSelector((state) => state.theme);

  // Apply dark mode theme
  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  // Socket and Notifications logic - runs when userInfo changes
  useEffect(() => {
    if (userInfo) {
      socket.connect();
      socket.emit('join', userInfo._id);
      dispatch(fetchNotifications());

      socket.on('notification', (data) => {
        dispatch(addNotification(data));
        toast.success(data.message, {
          duration: 5000,
          position: 'top-right',
        });
      });

      return () => {
        socket.off('notification');
        socket.disconnect();
      };
    }
  }, [userInfo, dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[120px] animate-blob"></div>
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      <Toaster />
      <Navbar />
      <main className="flex-grow py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPanel />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/gigs/create"
              element={
                <PrivateRoute>
                  <CreateGig />
                </PrivateRoute>
              }
            />
            <Route path="/gigs" element={<GigsFeed />} />
            <Route path="/gigs/:id" element={<GigDetail />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 dark:text-gray-500 text-sm font-bold tracking-widest uppercase">
            &copy; {new Date().getFullYear()} GigFlow • The Future of Freelancing
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
