import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, IndianRupee, ArrowRight, Filter, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigs, setSearchQuery, setSelectedCategory, setSelectedTags, setCurrentPage, resetFilters } from '../slices/gigSlice';
import { GigSkeleton } from '../components/common/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const GigsFeed = () => {
    const dispatch = useDispatch();
    const { gigs, loading, error, currentPage, limit, totalPages, searchQuery, selectedCategory, selectedTags } = useSelector((state) => state.gigs);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchQuery);

    const categories = ['Design', 'Development', 'Writing', 'Marketing', 'Other'];
    const popularTags = ['React', 'Node.js', 'JavaScript', 'UI/UX', 'Backend', 'Frontend', 'Fullstack', 'Mobile', 'Logo Design', 'SEO'];

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(setSearchQuery(localSearch));
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, dispatch]);

    useEffect(() => {
        dispatch(fetchGigs({
            page: currentPage,
            limit,
            search: searchQuery,
            category: selectedCategory,
            tags: selectedTags
        }));
    }, [dispatch, currentPage, limit, searchQuery, selectedCategory, selectedTags]);

    const handleTagToggle = (tag) => {
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        dispatch(setSelectedTags(newTags));
    };

    const handlePageChange = (page) => {
        dispatch(setCurrentPage(page));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Discover Gigs</h1>
                    <p className="text-gray-500 dark:text-gray-400">Explore the best opportunities from top-tier clients.</p>
                </div>
                <div className="flex w-full lg:w-auto gap-4">
                    <div className="relative flex-grow lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold shadow-sm ${
                            isFilterOpen || selectedCategory || selectedTags.length > 0
                            ? 'bg-brand-600 border-brand-600 text-white shadow-brand-500/25'
                            : 'glass border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <Filter size={20} />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Categories */}
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Categories</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => dispatch(setSelectedCategory(selectedCategory === cat ? '' : cat))}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                    selectedCategory === cat
                                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                                                    : 'bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="lg:col-span-2">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Popular Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {popularTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagToggle(tag)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                    selectedTags.includes(tag)
                                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                                                    : 'bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-gray-50/50 dark:border-gray-800/50 flex justify-between items-center">
                                <button 
                                    onClick={() => dispatch(resetFilters())}
                                    className="text-gray-500 hover:text-red-500 font-bold transition-colors"
                                >
                                    Reset All Filters
                                </button>
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="px-6 py-2 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gigs Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <GigSkeleton key={i} />)}
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
                    <p className="text-red-600 dark:text-red-400 font-bold">Error loading gigs: {error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 text-red-600 underline">Try again</button>
                </div>
            ) : gigs.length === 0 ? (
                <div className="text-center py-32 bg-gray-50/50 dark:bg-gray-800/25 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="max-w-xs mx-auto">
                        <Search className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Gigs Found</h3>
                        <p className="text-gray-500 dark:text-gray-400">We couldn't find any projects matching your current filters.</p>
                        <button 
                            onClick={() => dispatch(resetFilters())}
                            className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gigs.map((gig, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            key={gig._id}
                            whileHover={{ y: -8 }}
                        >
                            <Link 
                                to={`/gigs/${gig._id}`}
                                className="group block bg-white dark:bg-dark-card rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 border border-gray-100 dark:border-gray-800 p-6 h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500"></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        {gig.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-brand-600 font-black text-lg">
                                        <IndianRupee size={16} /> {gig.budget?.toLocaleString() || '0'}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 transition-colors line-clamp-1">
                                    {gig.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6">
                                    {gig.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {(gig.tags || []).slice(0, 3).map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-md border border-gray-100 dark:border-gray-700">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                                            {gig.ownerId?.avatar ? (
                                                <img src={gig.ownerId.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                gig.ownerId?.name?.charAt(0) || 'U'
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{gig.ownerId?.name || 'Unknown'}</p>
                                            <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                <Star size={12} fill="currentColor" />
                                                <span>{gig.ownerId?.rating?.toFixed(1) || '0.0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-xl group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-12">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 dark:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {[...Array(totalPages).keys()].map(i => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                                    currentPage === i + 1
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 dark:text-white"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default GigsFeed;
