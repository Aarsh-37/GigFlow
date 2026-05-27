import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Briefcase, FileText, CheckCircle, Clock, IndianRupee, ArrowRight, TrendingUp, Wallet, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import socket from '../socket';
import { motion } from 'framer-motion';

const Dashboard = ({ role: forcedRole, section }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const role = userInfo?.role;
    const isHirer = role === 'hirer' || role === 'admin';
    const isIntern = role === 'intern' || role === 'admin';
    const showToggle = role === 'admin'; 

    // Default to the user's primary role or the forced role from props
    const defaultTab = forcedRole || (role === 'intern' ? 'intern' : 'hirer');
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Sync active tab if forcedRole changes
    useEffect(() => {
        if (forcedRole) setActiveTab(forcedRole);
    }, [forcedRole]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard');
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
        socket.on('dashboard_update', fetchStats);
        socket.on('notification', fetchStats);
        return () => {
            socket.off('dashboard_update');
            socket.off('notification');
        };
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold">Assembling your dashboard...</p>
        </div>
    );

    const hirerGigs = stats?.hirer?.postedGigs || [];
    const internApplications = stats?.intern?.applications || [];

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                    <Icon className={color.replace('bg-', 'text-')} size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                    <TrendingUp size={14} /> +12%
                </div>
            </div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Welcome back, <span className="text-brand-600">{userInfo?.name?.split(' ')[0] || 'User'}!</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        {activeTab === 'hirer' ? 'Manage your posted internships and interns.' : 'Track your applications and work.'}
                    </p>
                </div>
                {showToggle && (
                    <div className="flex bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 relative">
                        <motion.div
                            className="absolute bg-white dark:bg-gray-700 rounded-xl shadow-lg"
                            initial={false}
                            animate={{
                                x: activeTab === 'hirer' ? 0 : '100%',
                                width: '50%',
                                height: 'calc(100% - 12px)',
                                top: '6px'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setActiveTab('hirer')}
                            className={`px-8 py-2.5 rounded-xl text-sm font-black transition-colors relative z-10 w-32 ${activeTab === 'hirer' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Hiring
                        </button>
                        <button
                            onClick={() => setActiveTab('intern')}
                            className={`px-8 py-2.5 rounded-xl text-sm font-black transition-colors relative z-10 w-32 ${activeTab === 'intern' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Applying
                        </button>
                    </div>
                )}
                {!showToggle && (
                    <div className={`px-4 py-2 rounded-xl text-sm font-black ${
                        role === 'hirer'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}>
                        {role === 'hirer' ? '🏢 Hirer Dashboard' : role === 'intern' ? '💼 Intern Dashboard' : '👑 Admin Dashboard'}
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeTab === 'hirer' ? (
                    <>
                        <StatCard title="Posted Internships" value={hirerGigs.length} icon={FileText} color="bg-brand-600" />
                        <StatCard title="Active Interns" value={stats?.hirer?.activeInterns?.length || 0} icon={CheckCircle} color="bg-blue-500" />
                        <StatCard title="Total Payouts" value={`₹${(stats?.hirer?.totalSpent || 0).toLocaleString()}`} icon={Wallet} color="bg-purple-600" />
                        <StatCard title="Wallet Balance" value={`₹${(stats?.user?.balance || 0).toLocaleString()}`} icon={IndianRupee} color="bg-emerald-500" />
                    </>
                ) : (
                    <>
                        <StatCard title="Applications" value={internApplications.length} icon={Briefcase} color="bg-orange-500" />
                        <StatCard title="Active Work" value={stats?.intern?.activeInternships?.length || 0} icon={Clock} color="bg-green-500" />
                        <StatCard title="Total Earned" value={`₹${(stats?.intern?.totalEarned || 0).toLocaleString()}`} icon={Wallet} color="bg-emerald-600" />
                        <StatCard title="Avg Rating" value={userInfo?.rating?.toFixed(1) || '0.0'} icon={Star} color="bg-yellow-500" />
                    </>
                )}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Main Activity List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                {activeTab === 'hirer' ? 'Recent Internships' : 'Recent Applications'}
                            </h2>
                            <Link to={activeTab === 'hirer' ? "/gigs/create" : "/gigs"} className="text-brand-600 font-bold text-sm hover:underline">
                                {activeTab === 'hirer' ? '+ Post New' : 'Browse More'}
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {(activeTab === 'hirer' ? hirerGigs : internApplications).length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Briefcase size={40} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold">Nothing to show yet.</p>
                                </div>
                            ) : (
                                (activeTab === 'hirer' ? hirerGigs : internApplications).slice(0, 5).map((item, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={item._id} 
                                        className="p-8 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                    >
                                        <div className="flex gap-6 items-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                {activeTab === 'hirer' ? <FileText size={24} /> : <Briefcase size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                                                    {activeTab === 'hirer' ? item.title : item.gigId?.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                                    <span className="flex items-center gap-1 text-indigo-600">
                                                        <IndianRupee size={12} /> {(activeTab === 'hirer' ? item.budget : (item.gigId?.budget || 0)).toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className={`uppercase tracking-widest ${
                                                        item.status === 'open' || item.status === 'HIRED' ? 'text-green-500' : 'text-orange-500'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/gigs/${activeTab === 'hirer' ? item._id : item.gigId?._id}`} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                                            <ArrowRight size={20} />
                                        </Link>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions & Sidebar */}
                <div className="space-y-8">
                    {/* Active Interns/Internships List */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                            {activeTab === 'hirer' ? 'Active Interns' : 'My Active Work'}
                        </h3>
                        <div className="space-y-4">
                            {(activeTab === 'hirer' ? stats?.hirer?.activeInterns : stats?.intern?.activeInternships)?.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No active projects currently.</p>
                            ) : (
                                (activeTab === 'hirer' ? stats?.hirer?.activeInterns : stats?.intern?.activeInternships).map(active => (
                                    <div key={active._id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                            {(activeTab === 'hirer' ? active.internName : active.gigId?.title)?.charAt(0) || 'I'}
                                        </div>
                                        <div className="flex-grow overflow-hidden">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                {activeTab === 'hirer' ? active.internName : active.gigId?.title}
                                            </p>
                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                                {activeTab === 'hirer' ? active.gigId?.title : 'In Progress'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
                        <div className="relative z-10">
                            <h4 className="text-lg font-black mb-2">Pro Tip</h4>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                                Keep your profile updated with your latest skills to attract better internships.
                            </p>
                            <Link to="/profile" className="inline-block px-6 py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors">
                                Update Profile
                            </Link>
                        </div>
                        <Star className="absolute -bottom-6 -right-6 text-indigo-500 opacity-30" size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
