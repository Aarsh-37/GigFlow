import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setCredentials } from '../slices/authSlice';
import { toggleTheme } from '../slices/themeSlice';
import api from '../utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    LogOut, PlusCircle, User, Briefcase, Bell, Home, 
    Menu, X, Sun, Moon, Search, Settings, ChevronDown, Zap,
    Wallet, IndianRupee, Plus, Loader2, CheckCircle
} from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Quick-add preset amounts
const PRESETS = [500, 1000, 2000, 5000, 10000];

const WalletModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { userInfo } = useSelector((state) => state.auth);
    const [amount, setAmount] = useState('');
    const [success, setSuccess] = useState(false);

    const addBalanceMutation = useMutation({
        mutationFn: (amt) => api.post('/auth/add-balance', { amount: amt }),
        onSuccess: (response) => {
            const updatedUser = response.data;
            if (updatedUser) dispatch(setCredentials(updatedUser));
            // Refresh dashboard so all stats reflect new balance
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onClose(); }, 1800);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to add balance.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (!parsed || parsed <= 0) return toast.error('Enter a valid amount.');
        if (parsed > 100000) return toast.error('Max ₹1,00,000 per transaction.');
        addBalanceMutation.mutate(parsed);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-1">Current Balance</p>
                            <p className="text-4xl font-black text-white">
                                ₹{(userInfo?.balance || 0).toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Wallet size={28} className="text-white" />
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    {success ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center py-6 gap-4"
                        >
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle size={36} className="text-green-600" />
                            </div>
                            <p className="text-xl font-black text-gray-900 dark:text-white">Balance Added!</p>
                            <p className="text-gray-500 text-sm">Your wallet has been topped up.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <p className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Quick Add</p>
                                <div className="flex flex-wrap gap-2">
                                    {PRESETS.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setAmount(String(p))}
                                            className={`px-4 py-2 rounded-xl text-sm font-black border-2 transition-all ${
                                                amount === String(p)
                                                    ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/25'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600'
                                            }`}
                                        >
                                            ₹{p.toLocaleString('en-IN')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                                    Custom Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black text-lg">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100000"
                                        step="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all dark:text-white font-bold text-lg"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 ml-1">Max ₹1,00,000 per transaction</p>
                            </div>

                            <button
                                type="submit"
                                disabled={addBalanceMutation.isPending || !amount}
                                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {addBalanceMutation.isPending
                                    ? <><Loader2 size={18} className="animate-spin" /> Adding...</>
                                    : <><Plus size={18} /> Add to Wallet</>
                                }
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const Navbar = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const { mode } = useSelector((state) => state.theme);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch notifications to get unread count via TanStack Query
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications');
            return Array.isArray(data) ? data : [];
        },
        enabled: !!userInfo,
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
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

    const role = userInfo?.role;
    const isHirer = role === 'hirer' || role === 'admin';
    const isIntern = role === 'intern' || role === 'admin';

    const roleBadge = {
        hirer: { label: 'Hirer', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
        intern: { label: 'Intern', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
        admin: { label: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    };

    const navLinks = [
        ...(isIntern ? [{ name: 'Find Internships', path: '/gigs', icon: <Search size={18} /> }] : []),
        ...(isHirer ? [{ name: 'Post Internship', path: '/gigs/create', icon: <PlusCircle size={18} /> }] : []),
        ...(!userInfo ? [{ name: 'Explore Internships', path: '/gigs', icon: <Search size={18} /> }] : []),
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
                                        {/* Wallet Balance Chip — Hirers only */}
                                        {isHirer && (
                                            <button
                                                onClick={() => setIsWalletOpen(true)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-green-200 dark:border-green-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                                                title="Top up wallet"
                                            >
                                                <Wallet size={16} className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                                                <span className="text-sm font-black text-green-700 dark:text-green-400">
                                                    ₹{(userInfo.balance || 0).toLocaleString('en-IN')}
                                                </span>
                                                <Plus size={13} className="text-green-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        )}

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
                                                <div className="flex flex-col items-start">
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-tight">{userInfo.name?.split(' ')[0] || 'User'}</span>
                                                    {role && roleBadge[role] && (
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${roleBadge[role].color}`}>
                                                            {roleBadge[role].label}
                                                        </span>
                                                    )}
                                                </div>
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
                                                        {isHirer && (
                                                            <>
                                                                <Link to="/gigs/create" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                                    <PlusCircle size={18} /> Post Internship
                                                                </Link>
                                                                <button
                                                                    onClick={() => { setIsProfileOpen(false); setIsWalletOpen(true); }}
                                                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
                                                                >
                                                                    <Wallet size={18} /> Top Up Wallet
                                                                </button>
                                                            </>
                                                        )}
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
                                        {isHirer && (
                                            <button
                                                onClick={() => { setIsMobileMenuOpen(false); setIsWalletOpen(true); }}
                                                className="flex items-center gap-4 w-full px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-lg font-bold text-green-700 dark:text-green-400"
                                            >
                                                <Wallet size={20} />
                                                Wallet — ₹{(userInfo.balance || 0).toLocaleString('en-IN')}
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => {
                                                setIsNotificationOpen(true);
                                                setIsMobileMenuOpen(false);
                                            }}
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

            {/* Wallet Top-Up Modal */}
            <AnimatePresence>
                {isWalletOpen && (
                    <WalletModal onClose={() => setIsWalletOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
