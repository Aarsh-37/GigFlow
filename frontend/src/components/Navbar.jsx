import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice'; // Local state cleanup
import api from '../utils/api'; // API for server logout
import { LogOut, PlusCircle, User, Briefcase, Bell, Home } from 'lucide-react'; // Added Home, Bell, Briefcase, User icons
import NotificationDropdown from './NotificationDropdown'; // New component for notifications

const Navbar = () => {

    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            dispatch(logout());
            navigate('/login');
        } catch (err) {
            console.error(err);
            toast.error('Logout failed. Please try again.'); // Added toast for feedback
        }
    };

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-display font-bold text-primary-600 tracking-tight">GigFlow</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {userInfo ? (
                            <>
                                {/* Only show Post Gig if user is client or both */}
                                {(userInfo.role === 'client' || userInfo.role === 'both') && (
                                    <Link to="/gigs/create" className="flex items-center gap-2 text-slate-600 hover:text-primary-600 font-medium transition-colors">
                                        <PlusCircle size={20} />
                                        <span className="hidden sm:inline">Post Gig</span>
                                    </Link>
                                )}

                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                                    <Link to="/" className="text-slate-400 hover:text-primary-600 transition-colors" title="Home">
                                        <Home size={20} />
                                    </Link>

                                    <NotificationDropdown />

                                    <Link to="/dashboard" className="text-slate-400 hover:text-primary-600 transition-colors" title="Dashboard">
                                        <Briefcase size={20} />
                                    </Link>

                                    <Link to="/profile" className="flex items-center gap-2 group">
                                        {/* Display first letter of user's name or a generic avatar */}
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold group-hover:bg-primary-200 transition-colors">
                                            {userInfo.name.charAt(0).toUpperCase()}
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium px-3 py-1.5 rounded-md"> {/* Added styling */}
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
