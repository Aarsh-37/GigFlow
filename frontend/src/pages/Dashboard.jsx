import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Briefcase, FileText, CheckCircle, Clock, IndianRupee, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import socket from '../socket';

const Dashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('client'); // 'client' or 'freelancer'

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/dashboard');
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
=======
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, IndianRupee, Clock, ArrowRight } from 'lucide-react';

const Dashboard = () => {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchGigs = async (search = '') => {
        setLoading(true);
        try {
            const { data } = await api.get(`/gigs?search=${search}`);
            setGigs(data);
        } catch (error) {
            console.error(error);
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
        }
        setLoading(false);
    };

    useEffect(() => {
<<<<<<< HEAD
        fetchStats();

        // Listen for events that should refresh the dashboard
        socket.on('dashboard_update', () => {
            fetchStats();
        });

        // Also refresh on general notifications that might affect stats
        socket.on('notification', () => {
            fetchStats();
        });

        return () => {
            socket.off('dashboard_update');
            socket.off('notification');
        };
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    const clientGigs = stats?.client?.postedGigs || [];
    const freelancerBids = stats?.freelancer?.appliedBids || [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Personal Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage your hiring and projects in one place</p>
                </div>
                <div className="flex bg-slate-200/50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'client' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Hiring
                    </button>
                    <button
                        onClick={() => setActiveTab('freelancer')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'freelancer' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Working
                    </button>
                </div>
            </div>

            {activeTab === 'client' ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card p-6 border-l-4 border-l-primary-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Posted Gigs</span>
                                <FileText className="text-primary-500" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{clientGigs.length}</div>
                        </div>
                        <div className="card p-6 border-l-4 border-l-indigo-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Hires</span>
                                <CheckCircle className="text-indigo-500" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{stats?.client?.activeHires?.length || 0}</div>
                        </div>
                        <div className="card p-6 border-l-4 border-l-emerald-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">My Balance</span>
                                <IndianRupee className="text-emerald-500" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">₹{stats?.user?.balance?.toLocaleString() || 0}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                <Clock size={20} className="text-slate-400" /> Recent Postings
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {clientGigs.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p>You haven't posted any gigs yet.</p>
                                    <Link to="/gigs/create" className="text-primary-600 font-bold mt-2 inline-block">Post your first gig</Link>
                                </div>
                            ) : (
                                clientGigs.map(gig => (
                                    <div key={gig._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-slate-900 capitalize">{gig.title}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <IndianRupee size={14} /> {gig.budget.toLocaleString()}
                                                </span>
                                                <span>•</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${gig.status === 'open' ? 'bg-green-50 text-green-600' :
                                                    gig.status === 'assigned' ? 'bg-primary-50 text-primary-600' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {gig.status}
                                                </span>
                                            </div>
                                        </div>
                                        <Link to={`/gigs/${gig._id}`} className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-colors">
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card p-6 border-l-4 border-l-orange-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Applied Bids</span>
                                <Briefcase className="text-orange-500" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{freelancerBids.length}</div>
                        </div>
                        <div className="card p-6 border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Projects</span>
                                <Clock className="text-green-500" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">{stats?.freelancer?.activeWork?.length || 0}</div>
                        </div>
                        <div className="card p-6 border-l-4 border-l-emerald-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Earnings</span>
                                <IndianRupee className="text-emerald-500" size={24} />
                            </div>
                            <div className="text-3xl font-bold text-slate-900">₹{stats?.user?.balance?.toLocaleString() || 0}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase size={20} className="text-slate-400" /> My Applications
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {freelancerBids.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <p>You haven't applied to any gigs yet.</p>
                                    <Link to="/" className="text-primary-600 font-bold mt-2 inline-block">Browse available gigs</Link>
                                </div>
                            ) : (
                                freelancerBids.map(bid => (
                                    <div key={bid._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-slate-900 capitalize">{bid.gigId?.title}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1 font-medium text-primary-600">
                                                    My Bid: <IndianRupee size={14} /> {bid.price.toLocaleString()}
                                                </span>
                                                <span>•</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${bid.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                                    bid.status === 'hired' ? 'bg-green-50 text-green-600' :
                                                        'bg-red-50 text-red-600'
                                                    }`}>
                                                    {bid.status}
                                                </span>
                                            </div>
                                        </div>
                                        <Link to={`/gigs/${bid.gigId?._id}`} className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-colors">
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
=======
        fetchGigs();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchGigs(searchTerm);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Explore Gigs</h1>
                    <p className="text-slate-500 mt-1">Find the perfect project or talent</p>
                </div>
                <form onSubmit={handleSearch} className="md:w-96 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        className="input-field pl-10 rounded-full bg-white shadow-sm"
                        placeholder="Search for gigs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-48 bg-slate-200 rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gigs.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No gigs found matching your criteria.
                        </div>
                    ) : (
                        gigs.map((gig) => (
                            <div key={gig._id} className="card hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-1 rounded inline-block uppercase tracking-wide">
                                            {gig.status}
                                        </div>
                                        <span className="text-slate-400 text-xs">
                                            {new Date(gig.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                        {gig.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                                        {gig.description}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
                                        <div className="flex items-center text-slate-700 font-medium">
                                            <IndianRupee size={16} className="text-primary-500 mr-1" />
                                            {gig.budget.toLocaleString()}
                                        </div>
                                        <div className="flex items-center text-slate-500">
                                            <span className="truncate max-w-[100px] text-right">
                                                by {gig.ownerId?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                                    <Link
                                        to={`/gigs/${gig._id}`}
                                        className="text-primary-600 font-medium text-sm flex items-center hover:gap-2 transition-all"
                                    >
                                        View Details <ArrowRight size={16} className="ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                </div>
            )}
        </div>
    );
};

export default Dashboard;
