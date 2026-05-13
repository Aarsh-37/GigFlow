import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { IndianRupee, Calendar, Trash2, Edit3, User, XCircle, CheckCircle, Clock } from 'lucide-react'; // Example icons
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { logout } from '../slices/authSlice'; // For handling unauthorized access

const MyGigsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    const [myGigs, setMyGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyGigs = async () => {
        if (!userInfo) {
            setError('Please log in to view your gigs.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Assuming an endpoint like /users/:userId/gigs exists or a general /gigs?ownerId=:userId
            const response = await api.get(`/users/${userInfo._id}/gigs`);
            setMyGigs(response.data);
        } catch (err) {
            console.error("Error fetching my gigs:", err);
            const errorMessage = err.response?.data?.message || 'Failed to load your gigs.';
            setError(errorMessage);
            toast.error(errorMessage);
            if (err.response?.status === 401) {
                dispatch(logout());
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyGigs();
    }, [userInfo, dispatch, navigate]);

    // --- Skeleton Loader ---
    const MyGigsSkeleton = () => (
        <div className="animate-pulse max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-8 px-8 py-6">
            <div className="h-8 w-48 bg-gray-300 rounded mb-6"></div>
            <ul className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <li key={i} className="flex items-center justify-between p-4 bg-gray-200 rounded-xl border border-gray-300">
                        <div className="flex-1">
                            <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                        </div>
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </li>
                ))}
            </ul>
        </div>
    );

    const handleDeleteGig = async (gigId, gigTitle) => {
        if (!window.confirm(`Are you sure you want to delete the gig "${gigTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/gigs/${gigId}`);
            toast.success('Gig deleted successfully!');
            // Remove the gig from the local state
            setMyGigs(myGigs.filter(gig => gig._id !== gigId));
        } catch (err) {
            console.error("Error deleting gig:", err);
            toast.error(err.response?.data?.message || 'Failed to delete gig.');
        }
    };

    if (loading) return <MyGigsSkeleton />;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!userInfo) return <div className="text-center text-slate-500 p-8">Please log in to view your gigs.</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">My Posted Gigs</h1>

            {myGigs.length === 0 ? (
                <div className="text-center py-16 bg-white shadow-lg rounded-lg">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">No gigs posted yet!</h2>
                    <p className="text-slate-500 mb-6">Create your first gig and start offering your services.</p>
                    <Link to="/create-gig" className="btn-primary px-6 py-3">Create Gig</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGigs.map((gig) => (
                        <div key={gig._id} className={clsx(
                            "card p-6 bg-white shadow-lg rounded-xl flex flex-col justify-between transition-all duration-300",
                            gig.status === 'open' ? "border-green-200" :
                                gig.status === 'assigned' ? "border-primary-200" :
                                    gig.status === 'in-progress' ? "border-orange-200" :
                                        gig.status === 'completed' ? "border-indigo-200" : "border-slate-200"
                        )}>
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-slate-900 mb-1 hover:underline">
                                    <Link to={`/gigs/${gig._id}`}>{gig.title}</Link>
                                </h2>
                                <p className="text-sm text-slate-500 mb-3">
                                    Status: <span className={clsx("font-semibold",
                                        gig.status === 'open' ? "text-green-600" :
                                        gig.status === 'assigned' ? "text-primary-600" :
                                        gig.status === 'in-progress' ? "text-orange-600" :
                                        gig.status === 'completed' ? "text-indigo-600" : "text-gray-600"
                                    )}>{gig.status.replace('-', ' ')}</span>
                                </p>
                                <p className="text-sm text-slate-500 flex items-center mb-1">
                                    <IndianRupee size={16} className="mr-1 text-primary-500" /> Budget: {gig.budget.toLocaleString()}
                                </p>
                                {gig.bidDeadline && (
                                    <p className="text-sm text-red-500 flex items-center"><Clock size={16} className="mr-1" /> Deadline: {new Date(gig.bidDeadline).toLocaleDateString()}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                <div className="text-sm text-slate-500">
                                    Posted: {new Date(gig.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Edit Button - navigate to create-gig with gig details pre-filled for editing */}
                                    <button
                                        onClick={() => navigate(`/create-gig?edit=${gig._id}`)}
                                        className="text-primary-600 hover:text-primary-800 transition-colors"
                                        title="Edit Gig"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteGig(gig._id, gig.title)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete Gig"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyGigsPage;
