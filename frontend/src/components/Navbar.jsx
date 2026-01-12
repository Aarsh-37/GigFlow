import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice'; // Local state cleanup
import api from '../utils/api'; // API for server logout
import { LogOut, PlusCircle, User, Briefcase } from 'lucide-react';

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
                                <Link to="/gigs/create" className="flex items-center gap-2 text-slate-600 hover:text-primary-600 font-medium transition-colors">
                                    <PlusCircle size={20} />
                                    <span className="hidden sm:inline">Post Gig</span>
                                </Link>
                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                            {userInfo.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden md:block font-medium text-slate-700">{userInfo.name}</span>
                                    </div>
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
                                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium px-3 py-2">
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
