import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import { toggleTheme } from '../slices/themeSlice';
import api from '../utils/api';
import { 
    LogOut, PlusCircle, User, Briefcase, Bell, Home, 
    Menu, X, Sun, Moon, Search, Settings, ChevronDown 
} from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.notifications);
    const { mode } = useSelector((state) => state.theme);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            dispatch(logout());
            navigate('/login');
            toast.success('Signed out successfully');
        } catch (err) {
            toast.error('Sign out failed');
        }
    };

    const navLinks = [
        { name: 'Explore', path: '/gigs', icon: <Search size={18} /> },
        { name: 'Dashboard', path: '/dashboard', icon: <Briefcase size={18} /> },
    ];

    return (
        <>
            <nav className={`sticky top-4 z-[90] transition-all duration-500 mx-4 sm:mx-6 lg:mx-8 rounded-2xl ${
                scrolled 
                ? 'glass py-2 shadow-2xl translate-y-2' 
                : 'bg-white/50 dark:bg-dark-bg/50 py-4 border border-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:rotate-12 transition-transform duration-500">
                                <Zap className="text-white fill-current" size={24} />
                            </div>
                            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                                Gig<span className="text-brand-600">Flow</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <div className="flex items-center gap-6">
                                {navLinks.map(link => (
                                    <Link 
                                        key={link.name} 
                                        to={link.path}
                                        className={`text-sm font-bold transition-all relative py-1 group ${
                                            location.pathname === link.path 
                                            ? 'text-brand-600' 
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {link.name}
                                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 transition-transform duration-300 origin-left ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                                    </Link>
                                ))}
                            </div>

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

                            <div className="flex items-center gap-4">
                                {/* Theme Toggle */}
                                <button 
                                    onClick={() => dispatch(toggleTheme())}
                                    className="p-2.5 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {mode === 'light' ? <Moon size={20} className="text-gray-600" /> : <Sun size={20} className="text-yellow-400" />}
                                </button>

                                {userInfo ? (
                                    <>
                                        {/* Notifications */}
                                        <button 
                                            onClick={() => setIsNotificationOpen(true)}
                                            className="p-2.5 rounded-xl glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                                        >
                                            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                                            )}
                                        </button>

                                        {/* Profile Dropdown */}
                                        <div className="relative">
                                            <button 
                                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                                className="flex items-center gap-3 p-1 pr-3 rounded-full glass border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-inner">
                                                    {userInfo.avatar ? (
                                                        <img src={userInfo.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        userInfo.name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{userInfo.name?.split(' ')[0] || 'User'}</span>
                                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isProfileOpen && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[100]"
                                                    >
                                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                            <User size={18} /> My Profile
                                                        </Link>
                                                        <Link to="/gigs/create" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                            <PlusCircle size={18} /> Post a Gig
                                                        </Link>
                                                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
                                                        <button 
                                                            onClick={handleLogout}
                                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                                        >
                                                            <LogOut size={18} /> Sign Out
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                                            Sign In
                                        </Link>
                                        <Link to="/register" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all">
                                            Join Now
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Toggle */}
                        <div className="md:hidden flex items-center gap-4">
                            <button 
                                onClick={() => dispatch(toggleTheme())}
                                className="p-2 text-gray-500 dark:text-gray-400"
                            >
                                {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-900 dark:text-white"
                            >
                                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="px-4 py-6 space-y-4">
                                {navLinks.map(link => (
                                    <Link 
                                        key={link.name} 
                                        to={link.path}
                                        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-lg font-bold text-gray-900 dark:text-white"
                                    >
                                        {link.icon} {link.name}
                                    </Link>
                                ))}
                                {userInfo ? (
                                    <>
                                        <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-lg font-bold text-gray-900 dark:text-white">
                                            <User size={20} /> My Profile
                                        </Link>
                                        <button 
                                            onClick={() => setIsNotificationOpen(true)}
                                            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-lg font-bold text-gray-900 dark:text-white"
                                        >
                                            <Bell size={20} /> Notifications ({unreadCount})
                                        </button>
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-lg font-bold text-red-500"
                                        >
                                            <LogOut size={20} /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <Link to="/login" className="py-3 text-center font-bold text-gray-700 dark:text-gray-300">Sign In</Link>
                                        <Link to="/register" className="py-3 text-center bg-indigo-600 text-white rounded-xl font-bold">Join Now</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <NotificationDrawer 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)} 
            />
        </>
    );
};

// Simple Zap icon component for the logo
const Zap = ({ className, size }) => (
    <svg 
        className={className} 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default Navbar;
