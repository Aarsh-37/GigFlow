import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
<<<<<<< HEAD
import GigsFeed from './pages/GigsFeed';
import Dashboard from './pages/Dashboard';
import CreateGig from './pages/CreateGig';
import GigDetail from './pages/GigDetail';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import socket from './socket';
import { addNotification, fetchNotifications } from './slices/notificationSlice';
import { setCredentials } from './slices/authSlice';
import api from './utils/api';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
=======
import Dashboard from './pages/Dashboard';
import CreateGig from './pages/CreateGig';
import GigDetail from './pages/GigDetail';
import { useSelector } from 'react-redux';

import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import socket from './socket';
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? children : <Navigate to="/login" />;
};

function App() {
  const { userInfo } = useSelector((state) => state.auth);
<<<<<<< HEAD
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
          console.log('No active session found');
        }
      }
    };
    checkAuth();
  }, []); // Empty dependency array = run only on mount

  // Socket and Notifications logic - runs when userInfo changes
  useEffect(() => {
    if (userInfo) {
      socket.emit('join', userInfo._id);
      dispatch(fetchNotifications());

      socket.on('notification', (data) => {
        dispatch(addNotification(data));
=======

  useEffect(() => {
    if (userInfo) {
      socket.emit('join', userInfo._id);

      socket.on('notification', (data) => {
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
        toast.success(data.message, {
          duration: 5000,
          position: 'top-right',
        });
      });

      return () => {
        socket.off('notification');
      };
    }
<<<<<<< HEAD
  }, [userInfo, dispatch]);
=======
  }, [userInfo]);
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Toaster />
      <Navbar />
      <main className="flex-grow py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <Routes>
<<<<<<< HEAD
          <Route path="/" element={<GigsFeed />} />
=======
          <Route path="/" element={<Dashboard />} />
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
<<<<<<< HEAD
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
=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
            path="/gigs/create"
            element={
              <PrivateRoute>
                <CreateGig />
              </PrivateRoute>
            }
          />
          <Route path="/gigs/:id" element={<GigDetail />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} GigFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
