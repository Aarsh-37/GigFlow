import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
// import api from '../utils/api'; // Not directly using api here, using Redux thunks
import { Search, MapPin, IndianRupee, Clock, ArrowRight, Filter } from 'lucide-react'; // Added Filter icon
import clsx from 'clsx'; // For conditional styling
import { useDispatch, useSelector } from 'react-redux'; // For Redux
import { fetchGigs, setSearchQuery, setSelectedCategory, setSelectedTags, setCurrentPage, resetFilters } from '../slices/gigSlice'; // Import Redux actions and thunk

const GigsFeed = () => {
    const dispatch = useDispatch();
    // Get state from Redux
    const { gigs, loading, error, currentPage, limit, totalPages, searchQuery, selectedCategory, selectedTags } = useSelector((state) => state.gigs);

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Debounce search input to avoid excessive API calls
    const debouncedSearch = useCallback((func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    }, []);

    // Fetch gigs when component mounts or filters/pagination change
    useEffect(() => {
        dispatch(fetchGigs({
            page: currentPage,
            limit: limit,
            search: searchQuery,
            category: selectedCategory,
            tags: selectedTags
        }));
    }, [dispatch, currentPage, limit, searchQuery, selectedCategory, selectedTags]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        dispatch(setSearchQuery(e.target.value));
    };

    // Handle category selection
    const handleCategoryChange = (e) => {
        dispatch(setSelectedCategory(e.target.value));
    };

    // Handle tag selection/deselection
    const handleTagToggle = (tag) => {
        const newTags = selectedTags.includes(tag)
            ? selectedTags.filter(t => t !== tag)
            : [...selectedTags, tag];
        dispatch(setSelectedTags(newTags));
    };

    // Handle page changes
    const handlePageChange = (page) => {
        dispatch(setCurrentPage(page));
    };

    // Apply filters when search/category/tags change (debounced)
    // We can either trigger fetch on every change (debounced) or use a separate apply button
    // For simplicity, let's use debounced search and direct updates for category/tags which might reset page
    useEffect(() => {
        // Debounced fetch on search query change
        const debouncedFetch = debouncedSearch(() => {
             dispatch(fetchGigs({ page: 1, limit, search: searchQuery, category: selectedCategory, tags: selectedTags }));
        }, 500); // 500ms debounce delay
        if (searchQuery) {
            debouncedFetch();
        } else {
             // If search is cleared, fetch immediately or reset filters if needed
             // For now, let filter changes trigger fetch directly with reset page
             // dispatch(fetchGigs({ page: 1, limit, search: '', category: selectedCategory, tags: selectedTags }));
        }
        return () => clearTimeout(debouncedFetch); // Cleanup debounce
    }, [searchQuery, dispatch, limit, selectedCategory, selectedTags, debouncedSearch]);

    // Reset filters and fetch when reset button is clicked
    const handleResetFilters = () => {
        dispatch(resetFilters());
        // fetchGigs is dispatched by the useEffect hook due to resetFilters updating state
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Explore Gigs</h1>
                    <p className="text-slate-500 mt-1">Find the perfect project or talent</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={(e) => e.preventDefault()} className="md:w-96 relative flex items-center">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            className="input-field pl-10 rounded-full bg-white shadow-sm"
                            placeholder="Search for gigs..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </form>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Filter size={18} /> Filter
                    </button>
                </div>
            </div>

            {/* Filter Sidebar/Dropdown */}
            {isFilterOpen && (
                <div className="bg-white card p-6 rounded-2xl shadow-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-slate-900">Filters</h3>
                        <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                    </div>
                    <div className="space-y-4">
                        {/* Category Filter */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                className="input-field"
                            >
                                <option value="">All Categories</option>
                                <option value="Design">Design</option>
                                <option value="Development">Development</option>
                                <option value="Writing">Writing</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Tags Filter (Simple multi-select example) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'Node.js', 'JavaScript', 'UI/UX', 'Backend', 'Frontend', 'Fullstack'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagToggle(tag)}
                                        className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                                            selectedTags.includes(tag)
                                                ? 'bg-primary-100 border-primary-500 text-primary-700 font-bold'
                                                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                                        )}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between">
                        <button onClick={handleResetFilters} className="btn-secondary">Reset</button>
                        <button onClick={() => setIsFilterOpen(false)} className="btn-primary">Apply Filters</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-48 bg-slate-200 rounded-xl"></div>
                    ))}
                </div>
            ) : error ? (
                 <div className="text-center text-lg text-red-500 font-bold py-12">Error: {error}</div>
            ) : gigs.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500">
                    No gigs found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gigs.map((gig) => (
                        <div key={gig._id} className="card hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-1 rounded inline-block uppercase tracking-wide">
                                        {gig.category || 'General'} {/* Display category */}
                                    </div>
                                    <span className="text-slate-400 text-xs">
                                        {new Date(gig.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                                    {gig.title}
                                </h3>
                                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                                    {gig.description}
                                </p>
                                {/* Display tags if available */}
                                {gig.tags && gig.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {gig.tags.slice(0, 3).map(tag => ( // Show max 3 tags
                                            <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                )}
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
                }
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-l-lg border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    {[...Array(totalPages).keys()].map(num => (
                        <button
                            key={num + 1}
                            onClick={() => handlePageChange(num + 1)}
                            className={`px-4 py-2 border-y border-r border-slate-300 ${currentPage === num + 1 ? 'bg-primary-500 text-white font-bold' : 'bg-white text-slate-700'}`}
                        >
                            {num + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-r-lg border border-slate-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default GigsFeed;
