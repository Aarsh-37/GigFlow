import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateGig from './pages/CreateGig';
import GigDetail from './pages/GigDetail';
import { useSelector } from 'react-redux';

import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import socket from './socket';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? children : <Navigate to="/login" />;
};

function App() {
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      socket.emit('join', userInfo._id);

      socket.on('notification', (data) => {
        toast.success(data.message, {
          duration: 5000,
          position: 'top-right',
        });
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [userInfo]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Toaster />
      <Navbar />
      <main className="flex-grow py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
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
