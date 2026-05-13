import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Briefcase, FileText, CheckCircle, Clock, IndianRupee, ArrowRight, User, TrendingUp, Wallet, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import socket from '../socket';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('client');

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

    const clientGigs = stats?.client?.postedGigs || [];
    const freelancerBids = stats?.freelancer?.appliedBids || [];

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
                        Welcome back, <span className="text-indigo-600">{userInfo.name.split(' ')[0]}!</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Here's what's happening with your projects today.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'client' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-xl' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Hiring
                    </button>
                    <button
                        onClick={() => setActiveTab('freelancer')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'freelancer' ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-xl' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Working
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {activeTab === 'client' ? (
                    <>
                        <StatCard title="Posted Gigs" value={clientGigs.length} icon={FileText} color="bg-indigo-600" />
                        <StatCard title="Active Hires" value={stats?.client?.activeHires?.length || 0} icon={CheckCircle} color="bg-blue-500" />
                        <StatCard title="Total Spent" value={`₹${(stats?.client?.totalSpent || 0).toLocaleString()}`} icon={Wallet} color="bg-purple-600" />
                        <StatCard title="Wallet Balance" value={`₹${(stats?.user?.balance || 0).toLocaleString()}`} icon={IndianRupee} color="bg-emerald-500" />
                    </>
                ) : (
                    <>
                        <StatCard title="Applied Bids" value={freelancerBids.length} icon={Briefcase} color="bg-orange-500" />
                        <StatCard title="Active Work" value={stats?.freelancer?.activeWork?.length || 0} icon={Clock} color="bg-green-500" />
                        <StatCard title="Total Earned" value={`₹${(stats?.freelancer?.totalEarned || 0).toLocaleString()}`} icon={Wallet} color="bg-emerald-600" />
                        <StatCard title="Avg Rating" value={userInfo.rating?.toFixed(1) || '0.0'} icon={Star} color="bg-yellow-500" />
                    </>
                )}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Main Activity List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                {activeTab === 'client' ? 'Recent Gigs' : 'Recent Applications'}
                            </h2>
                            <Link to={activeTab === 'client' ? "/gigs/create" : "/gigs"} className="text-indigo-600 font-bold text-sm hover:underline">
                                {activeTab === 'client' ? '+ Post New' : 'Browse More'}
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {(activeTab === 'client' ? clientGigs : freelancerBids).length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Briefcase size={40} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-bold">Nothing to show yet.</p>
                                </div>
                            ) : (
                                (activeTab === 'client' ? clientGigs : freelancerBids).slice(0, 5).map((item, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={item._id} 
                                        className="p-8 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                    >
                                        <div className="flex gap-6 items-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-500 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                {activeTab === 'client' ? <FileText size={24} /> : <Briefcase size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                                                    {activeTab === 'client' ? item.title : item.gigId?.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                                    <span className="flex items-center gap-1 text-indigo-600">
                                                        <IndianRupee size={12} /> {(activeTab === 'client' ? item.budget : item.price).toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className={`uppercase tracking-widest ${
                                                        item.status === 'open' || item.status === 'hired' ? 'text-green-500' : 'text-orange-500'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/gigs/${activeTab === 'client' ? item._id : item.gigId?._id}`} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
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
                    {/* Active Hires/Work List */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                            {activeTab === 'client' ? 'Active Freelancers' : 'My Active Gigs'}
                        </h3>
                        <div className="space-y-4">
                            {(activeTab === 'client' ? stats?.client?.activeHires : stats?.freelancer?.activeWork)?.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm italic">No active projects currently.</p>
                            ) : (
                                (activeTab === 'client' ? stats?.client?.activeHires : stats?.freelancer?.activeWork).map(active => (
                                    <div key={active._id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                            {active.name?.charAt(0) || 'P'}
                                        </div>
                                        <div className="flex-grow overflow-hidden">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{active.name || active.title}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">In Progress</p>
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
                                Keep your profile updated with your latest work to attract better opportunities.
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
