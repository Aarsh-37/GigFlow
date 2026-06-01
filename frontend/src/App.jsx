import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Login from './modules/shared/pages/Login';
import Register from './modules/shared/pages/Register';
import GigsFeed from './modules/intern/pages/GigsFeed';
import Dashboard from './modules/shared/pages/Dashboard';
import CreateGig from './modules/hiring/pages/CreateGig';
import GigDetail from './modules/shared/pages/GigDetail';
import Profile from './modules/shared/pages/Profile';
import AdminPanel from './modules/shared/pages/AdminPanel';
import LandingPage from './modules/shared/pages/LandingPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import socket from './socket';
import { setCredentials, setAuthLoading } from './slices/authSlice';
import api from './utils/api';

const PrivateRoute = ({ children }) => {
  const { userInfo, isLoading } = useSelector((state) => state.auth);
  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-brand-600 animate-spin" /></div>;
  return userInfo ? children : <Navigate to="/login" />;
};

const HirerRoute = ({ children }) => {
  const { userInfo, isLoading } = useSelector((state) => state.auth);
  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-brand-600 animate-spin" /></div>;
  if (!userInfo) return <Navigate to="/login" />;
  if (userInfo.role !== 'hirer' && userInfo.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const InternRoute = ({ children }) => {
  const { userInfo, isLoading } = useSelector((state) => state.auth);
  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-brand-600 animate-spin" /></div>;
  if (!userInfo) return <Navigate to="/login" />;
  if (userInfo.role !== 'intern' && userInfo.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { userInfo, isLoading } = useSelector((state) => state.auth);
  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-brand-600 animate-spin" /></div>;
  if (!userInfo) return <Navigate to="/login" />;
  if (userInfo.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Initial session recovery - sync with backend on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        dispatch(setCredentials(data));
      } catch (error) {
        // If we get a 401, it means the session is truly invalid
        if (error.response?.status === 401) {
          if (userInfo) {
            dispatch(setCredentials(null));
          }
        }
        // Other errors (500, network, etc.) are ignored to keep the cached session active
        console.error('Initial session check failed:', error.message);
      } finally {
        dispatch(setAuthLoading(false));
      }
    };
    checkAuth();
  }, [dispatch]); // Still run on every mount to ensure role freshness, but now it's safe

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

      socket.on('notification', (data) => {
        // Invalidate notifications query to trigger refetch
        queryClient.invalidateQueries(['notifications']);
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
  }, [userInfo, queryClient]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[120px] animate-blob"></div>
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[120px] animate-blob animation-delay-2000"></div>
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

            {/* Common Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Hirer Routes */}
            <Route path="/hirer/dashboard" element={<HirerRoute><Dashboard role="hirer" /></HirerRoute>} />
            <Route path="/gigs/create" element={<HirerRoute><CreateGig /></HirerRoute>} />

            {/* Intern Routes */}
            <Route path="/intern/dashboard" element={<InternRoute><Dashboard role="intern" /></InternRoute>} />
            <Route path="/intern/applications" element={<InternRoute><Dashboard section="applications" /></InternRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* Public/Mixed Access */}
            <Route path="/gigs" element={<GigsFeed />} />
            <Route path="/gigs/:id" element={<GigDetail />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <footer className="bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 dark:text-gray-500 text-sm font-bold tracking-widest uppercase">
            &copy; {new Date().getFullYear()} GigFlow • The Future of Internship Hiring
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
