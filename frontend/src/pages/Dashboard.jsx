import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react';

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
        }
        setLoading(false);
    };

    useEffect(() => {
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
                                            <DollarSign size={16} className="text-primary-500 mr-1" />
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
                </div>
            )}
        </div>
    );
};

export default Dashboard;
