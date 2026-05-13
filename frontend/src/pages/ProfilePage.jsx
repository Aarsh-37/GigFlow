import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api'; // Assuming api utility is set up
import { IndianRupee, Calendar, User, Briefcase, Star, Linkedin, Github, Twitter } from 'lucide-react'; // Example icons
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // For navigation
import { logout } from '../slices/authSlice'; // Assuming logout action is available

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    const [profile, setProfile] = useState(null);
    const [userGigs, setUserGigs] = useState([]);
    const [userBids, setUserBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch profile, gigs, and bids
    const fetchProfileData = async () => {
        if (!userInfo) {
            setError('Please log in to view your profile.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch user details
            const userResponse = await api.get('/auth/me'); // Assuming /auth/me provides full user data
            setProfile(userResponse.data);

            // Fetch user's posted gigs
            const gigsResponse = await api.get(`/users/${userInfo._id}/gigs`); // Assuming this endpoint exists
            setUserGigs(gigsResponse.data);

            // Fetch user's submitted bids
            const bidsResponse = await api.get(`/users/${userInfo._id}/bids`); // Assuming this endpoint exists
            setUserBids(bidsResponse.data);

        } catch (err) {
            console.error("Error fetching profile data:", err);
            const errorMessage = err.response?.data?.message || 'Failed to load profile data.';
            setError(errorMessage);
            toast.error(errorMessage);
            // If unauthorized, trigger logout
            if (err.response?.status === 401) {
                dispatch(logout());
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [userInfo, dispatch, navigate]); // Re-fetch if user info changes or on mount

    // --- Skeleton Loader ---
    const ProfileSkeleton = () => (
        <div className="animate-pulse max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-8">
            <div className="h-48 bg-gray-300"></div> {/* Banner skeleton */}
            <div className="px-8 py-6">
                <div className="flex items-center -mt-16 mb-4">
                    <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white"></div>
                    <div className="ml-4">
                        <div className="h-8 w-48 bg-gray-300 rounded"></div>
                        <div className="h-5 w-32 bg-gray-300 rounded mt-2"></div>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="h-6 w-64 bg-gray-300 rounded"></div>
                    <div className="h-4 w-48 bg-gray-300 rounded mt-2"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="h-5 w-32 bg-gray-300 rounded mb-3"></div>
                        <div className="h-40 bg-gray-300 rounded"></div>
                    </div>
                    <div>
                        <div className="h-5 w-32 bg-gray-300 rounded mb-3"></div>
                        <div className="h-40 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <ProfileSkeleton />;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!profile) return <div className="text-center text-slate-500 p-8">Profile not found.</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
                {/* Banner Area - Placeholder */}
                <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative"></div>

                <div className="px-8 py-6">
                    <div className="flex items-center -mt-16 mb-4 relative">
                        <img
                            src={profile.avatar || '/path/to/default/avatar.png'} // Use default avatar if none
                            alt="Profile Avatar"
                            className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                        />
                        <div className="ml-6">
                            <h1 className="text-3xl font-display font-bold text-slate-900">{profile.name}</h1>
                            <p className="text-lg text-slate-600 font-medium flex items-center">
                                <User className="mr-2 text-slate-400" size={18} />
                                {profile.role === 'freelancer' ? 'Freelancer' : profile.role === 'client' ? 'Client' : 'User'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Bio</h2>
                        <p className="text-slate-600 font-medium leading-relaxed">{profile.bio || 'This user has not provided a bio yet.'}</p>
                    </div>

                    {/* Skills Section */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span key={index} className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Stats & Contact */}
                <div className="md:col-span-1 space-y-8">
                    {/* Stats Card */}
                    <div className="card p-6 bg-white shadow-lg">
                        <h3 className="font-bold text-slate-900 mb-4">Stats</h3>
                        <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium">
                            <Star className="text-primary-500" size={18} />
                            <span>Rating: {profile.averageRating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium">
                            <Briefcase className="text-primary-500" size={18} />
                            <span>Completed Gigs: {profile.totalGigs || 0}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium">
                            <IndianRupee className="text-primary-500" size={18} />
                            <span>Balance: {formatCurrency(profile.balance || 0)}</span>
                        </div>
                    </div>

                    {/* Contact Info Card */}
                    <div className="card p-6 bg-white shadow-lg">
                        <h3 className="font-bold text-slate-900 mb-4">Contact</h3>
                        <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-500"><path d="M1.5 8.67v8.18c0 .69.56 1.25 1.25 1.25h16.5c.69 0 1.25-.56 1.25-1.25V8.67l-8.72 5.18a1.25 1.25 0 0 1-1.06 0L1.5 8.67Z" /><path d="M1.5 6.25a1.25 1.25 0 0 1 1.25-1.25h16.5c.69 0 1.25.56 1.25 1.25v.38a1.25 1.25 0 0 1-1.25 1.25H2.75a1.25 1.25 0 0 1-1.25-1.25V6.25Z" /></svg>
                            <span>{profile.email}</span>
                        </div>
                        {/* Add more contact details if available (phone, social links) */}
                        {profile.linkedin && (
                            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-3 text-blue-600 font-medium hover:underline">
                                <Linkedin className="text-blue-600" size={18} />
                                <span>LinkedIn</span>
                            </a>
                        )}
                         {profile.github && (
                            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-3 text-gray-800 font-medium hover:underline">
                                <Github className="text-gray-800" size={18} />
                                <span>GitHub</span>
                            </a>
                        )}
                         {profile.twitter && (
                            <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-3 text-blue-500 font-medium hover:underline">
                                <Twitter className="text-blue-500" size={18} />
                                <span>Twitter</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Column: Gigs & Bids */}
                <div className="md:col-span-2 space-y-8">
                    {/* Posted Gigs Section */}
                    {userGigs.length > 0 && (
                        <div className="card p-6 bg-white shadow-lg">
                            <h3 className="font-bold text-slate-900 mb-4">My Posted Gigs ({userGigs.length})</h3>
                            <ul className="space-y-4">
                                {userGigs.slice(0, 5).map((gig) => ( // Display first 5 gigs
                                    <li key={gig._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex-1">
                                            <Link to={`/gigs/${gig._id}`} className="font-medium text-primary-600 hover:underline">{gig.title}</Link>
                                            <p className="text-sm text-slate-500">Status: <span className={clsx("font-semibold", gig.status === 'open' ? "text-green-600" : "text-gray-600")}>{gig.status.replace('-', ' ')}</span></p>
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {new Date(gig.createdAt).toLocaleDateString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {userGigs.length > 5 && (
                                <button onClick={() => navigate('/my-gigs')} className="mt-4 text-primary-600 font-medium hover:underline">View all my gigs...</button>
                            )}
                        </div>
                    )}

                    {/* Submitted Bids Section */}
                    {userBids.length > 0 && (
                        <div className="card p-6 bg-white shadow-lg">
                            <h3 className="font-bold text-slate-900 mb-4">My Submitted Bids ({userBids.length})</h3>
                            <ul className="space-y-4">
                                {userBids.slice(0, 5).map((bid) => ( // Display first 5 bids
                                    <li key={bid._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
                                            <Link to={`/gigs/${bid.gigId._id}`} className="font-medium text-primary-600 hover:underline">{bid.gigId.title}</Link>
                                            <span className={clsx(
                                                "text-sm font-semibold px-2 py-0.5 rounded-full",
                                                bid.status === 'hired' ? "bg-green-100 text-green-700" :
                                                bid.status === 'rejected' ? "bg-red-100 text-red-700" :
                                                bid.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                                            )}>{bid.status.toUpperCase()}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-2">Bid Price: <span className="font-bold">₹{bid.price}</span></p>
                                        <p className="text-sm text-slate-500 italic">"{bid.message}"</p>
                                    </li>
                                ))}
                            </ul>
         import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api'; // Assuming api utility is set up
import { IndianRupee, Calendar, User, Briefcase, Star, Linkedin, Github, Twitter, Trash2 } from 'lucide-react'; // Added Trash2 for withdraw icon
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // For navigation
import { logout } from '../slices/authSlice'; // Assuming logout action is available

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    const [profile, setProfile] = useState(null);
    const [userGigs, setUserGigs] = useState([]);
    const [userBids, setUserBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch profile, gigs, and bids
    const fetchProfileData = async () => {
        if (!userInfo) {
            setError('Please log in to view your profile.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch user details
            const userResponse = await api.get('/auth/me'); // Assuming /auth/me provides full user data
            setProfile(userResponse.data);

            // Fetch user's posted gigs
            const gigsResponse = await api.get(`/users/${userInfo._id}/gigs`); // Assuming this endpoint exists
            setUserGigs(gigsResponse.data);

            // Fetch user's submitted bids
            const bidsResponse = await api.get(`/users/${userInfo._id}/bids`); // Assuming this endpoint exists
            setUserBids(bidsResponse.data);

        } catch (err) {
            console.error("Error fetching profile data:", err);
            const errorMessage = err.response?.data?.message || 'Failed to load profile data.';
            setError(errorMessage);
            toast.error(errorMessage);
            // If unauthorized, trigger logout
            if (err.response?.status === 401) {
                dispatch(logout());
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [userInfo, dispatch, navigate]); // Re-fetch if user info changes or on mount

    // --- Skeleton Loader ---
    const ProfileSkeleton = () => (
        <div className="animate-pulse max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-8">
            <div className="h-48 bg-gray-300"></div> {/* Banner skeleton */}
            <div className="px-8 py-6">
                <div className="flex items-center -mt-16 mb-4">
                    <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white"></div>
                    <div className="ml-4">
                        <div className="h-8 w-48 bg-gray-300 rounded"></div>
                        <div className="h-5 w-32 bg-gray-300 rounded mt-2"></div>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="h-6 w-64 bg-gray-300 rounded"></div>
                    <div className="h-4 w-48 bg-gray-300 rounded mt-2"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="h-5 w-32 bg-gray-300 rounded mb-3"></div>
                        <div className="h-40 bg-gray-300 rounded"></div>
                    </div>
                    <div>
                        <div className="h-5 w-32 bg-gray-300 rounded mb-3"></div>
                        <div className="h-40 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <ProfileSkeleton />;
    if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
    if (!profile) return <div className="text-center text-slate-500 p-8">Profile not found.</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    // Handle bid withdrawal
    const handleWithdrawBid = async (bidId, bidTitle) => {
        if (!window.confirm(`Are you sure you want to withdraw your bid for "${bidTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/bids/${bidId}`);
            toast.success('Bid withdrawn successfully!');
            // Remove the bid from the local state
            setUserBids(userBids.filter(bid => bid._id !== bidId));
        } catch (err) {
            console.error("Error withdrawing bid:", err);
            toast.error(err.response?.data?.message || 'Failed to withdraw bid.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
                {/* Banner Area - Placeholder */}
                <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative"></div>

                <div className="px-8 py-6">
                    <div className="flex items-center -mt-16 mb-4 relative">
                        <img
                            src={profile.avatar || '/path/to/default/avatar.png'} // Use default avatar if none
                            alt="Profile Avatar"
                            className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                        />
                        <div className="ml-6">
                            <h1 className="text-3xl font-display font-bold text-slate-900">{profile.name}</h1>
                            <p className="text-lg text-slate-600 font-medium flex items-center">
                                <User className="mr-2 text-slate-400" size={18} />
                                {profile.role === 'freelancer' ? 'Freelancer' : profile.role === 'client' ? 'Client' : 'User'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Bio</h2>
                        <p className="text-slate-600 font-medium leading-relaxed">{profile.bio || 'This user has not provided a bio yet.'}</p>
                    </div>

                    {/* Skills Section */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <span key={index} className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Stats & Contact */}
                <div className="md:col-span-1 space-y-8">
                    {/* Stats Card */}
                    <div className="card p-6 bg-white shadow-lg">
                        <h3 className="font-bold text-slate-900 mb-4">Stats</h3>
                        <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium">
                            <Star className="text-primary-500" size={18} />
                            <span>Rating: {profile.averageRating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium">
                            <Briefcase className="text-primary-500" size={18} />
                            <span>Completed Gigs: {profile.totalGigs || 0}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium">
                            <IndianRupee className="text-primary-500" size={18} />
                            <span>Balance: {formatCurrency(profile.balance || 0)}</span>
                        </div>
                    </div>

                    {/* Contact Info Card */}
                    <div className="card p-6 bg-white shadow-lg">
                        <h3 className="font-bold text-slate-900 mb-4">Contact</h3>
                        <div className="flex items-center gap-3 mb-3 text-slate-700 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-500"><path d="M1.5 8.67v8.18c0 .69.56 1.25 1.25 1.25h16.5c.69 0 1.25-.56 1.25-1.25V8.67l-8.72 5.18a1.25 1.25 0 0 1-1.06 0L1.5 8.67Z" /><path d="M1.5 6.25a1.25 1.25 0 0 1 1.25-1.25h16.5c.69 0 1.25.56 1.25 1.25v.38a1.25 1.25 0 0 1-1.25 1.25H2.75a1.25 1.25 0 0 1-1.25-1.25V6.25Z" /></svg>
                            <span>{profile.email}</span>
                        </div>
                        {/* Add more contact details if available (phone, social links) */}
                        {profile.linkedin && (
                            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-3 text-blue-600 font-medium hover:underline">
                                <Linkedin className="text-blue-600" size={18} />
                                <span>LinkedIn</span>
                            </a>
                        )}
                         {profile.github && (
                            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-3 text-gray-800 font-medium hover:underline">
                                <Github className="text-gray-800" size={18} />
                                <span>GitHub</span>
                            </a>
                        )}
                         {profile.twitter && (
                            <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 mb-3 text-blue-500 font-medium hover:underline">
                                <Twitter className="text-blue-500" size={18} />
                                <span>Twitter</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Column: Gigs & Bids */}
                <div className="md:col-span-2 space-y-8">
                    {/* Posted Gigs Section */}
                    {userGigs.length > 0 && (
                        <div className="card p-6 bg-white shadow-lg">
                            <h3 className="font-bold text-slate-900 mb-4">My Posted Gigs ({userGigs.length})</h3>
                            <ul className="space-y-4">
                                {userGigs.slice(0, 5).map((gig) => ( // Display first 5 gigs
                                    <li key={gig._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex-1">
                                            <Link to={`/gigs/${gig._id}`} className="font-medium text-primary-600 hover:underline">{gig.title}</Link>
                                            <p className="text-sm text-slate-500">Status: <span className={clsx("font-semibold", gig.status === 'open' ? "text-green-600" : "text-gray-600")}>{gig.status.replace('-', ' ')}</span></p>
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            {new Date(gig.createdAt).toLocaleDateString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {userGigs.length > 5 && (
                                <button onClick={() => navigate('/my-gigs')} className="mt-4 text-primary-600 font-medium hover:underline">View all my gigs...</button>
                            )}
                        </div>
                    )}

                    {/* Submitted Bids Section */}
                    {userBids.length > 0 ? (
                        <div className="card p-6 bg-white shadow-lg">
                            <h3 className="font-bold text-slate-900 mb-4">My Submitted Bids ({userBids.length})</h3>
                            <ul className="space-y-4">
                                {userBids.slice(0, 5).map((bid) => ( // Display first 5 bids
                                    <li key={bid._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex-1">
                                            <Link to={`/gigs/${bid.gigId._id}`} className="font-medium text-primary-600 hover:underline">{bid.gigId.title}</Link>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center gap-1 font-medium text-primary-600">
                                                    My Bid: <IndianRupee size={14} /> {bid.price.toLocaleString()}
                                                </span>
                                                <span>•</span>
                                                <span className={clsx(
                                                    "text-sm font-semibold px-2 py-0.5 rounded-full",
                                                    bid.status === 'hired' ? "bg-green-100 text-green-700" :
                                                    bid.status === 'rejected' ? "bg-red-100 text-red-700" :
                                                    bid.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                                                )}>{bid.status.toUpperCase()}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 italic mt-1">"{bid.message}"</p>
                                        </div>
                                        {bid.status === 'pending' && ( // Only show withdraw button for pending bids
                                            <button
                                                onClick={() => handleWithdrawBid(bid._id, bid.gigId.title)}
                                                className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                title="Withdraw Bid"
                                            >
                                                <Trash2 size={16} /> Withdraw
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                             {userBids.length > 5 && (
                                <button onClick={() => navigate('/my-bids')} className="mt-4 text-primary-600 font-medium hover:underline">View all my bids...</button>
                            )}
                        </div>
                    ) : (
                        // Empty state for bids if user has no submitted bids
                        <div className="card p-6 bg-white shadow-lg text-center text-slate-400 py-12">
                            <p>You haven't submitted any bids yet.</p>
                            <Link to="/" className="text-primary-600 font-bold mt-2 inline-block">Explore available gigs</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
