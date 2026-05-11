import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { ArrowLeft, IndianRupee, Calendar, User, CheckCircle, XCircle, Clock, Briefcase, DollarSign, Award, Edit } from 'lucide-react'; // Added icons for profile
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { fetchUserGigs, fetchUserBids } from '../slices/profileSlice'; // Assuming these thunks will be created
import { fetchUserProfile } from '../slices/userSlice'; // Assuming a slice for user profile details

const Profile = () => {
    const { id } = useParams(); // Could use this if profile route was /users/:id/profile
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const { userProfile, userGigs, userBids, profileStatus, profileError } = useSelector((state) => state.profile); // Assuming a combined 'profile' slice

    // State for local management if needed, e.g., for editing
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState(''); // Input as string, split later
    const [profilePic, setProfilePic] = useState('');

    // Determine which user profile to fetch: logged-in user's or another user's
    // For now, assume we are always viewing the logged-in user's profile via /profile route
    const userIdToFetch = userInfo?._id; // Use logged-in user's ID

    useEffect(() => {
        if (userIdToFetch) {
            dispatch(fetchUserProfile(userIdToFetch)); // Fetch user details
            dispatch(fetchUserGigs(userIdToFetch));   // Fetch gigs posted by user
            dispatch(fetchUserBids(userIdToFetch));   // Fetch bids submitted by user
        } else {
            // If no userInfo, redirect to login or show public profile if allowed
            // For now, assuming /profile is always private
            navigate('/login');
        }
    }, [dispatch, userIdToFetch, navigate]);

    // Handle loading and error states
    if (profileStatus === 'loading') {
        return <div className="text-center text-lg text-gray-500">Loading profile...</div>;
    }
    if (profileStatus === 'failed') {
        return <div className="text-center text-lg text-red-500 font-bold">Error: {profileError || 'Could not load profile'}</div>;
    }
    if (!userProfile) {
        return <div className="text-center text-lg text-gray-500">Profile not found.</div>;
    }

    // Prepare skills for display/editing
    const skillsArray = Array.isArray(userProfile.skills) ? userProfile.skills : (userProfile.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const skillsString = skillsArray.join(', ');

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
                <ArrowLeft size={18} className="mr-1" /> Back
            </button>

            {/* Profile Header Card */}
            <div className="card p-8 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border-0 overflow-hidden relative">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {userProfile.profilePic ? (
                        <img src={userProfile.profilePic} alt="Profile Picture" className="w-32 h-32 rounded-full object-cover shadow-md" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-5xl shadow-md">
                            {userProfile.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-display font-bold text-slate-900 mb-1">{userProfile.name}</h1>
                        <p className="text-sm font-medium text-slate-500 mb-2">@{userProfile.email.split('@')[0]}</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                             <div className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                                <Award size={16} className="text-yellow-500"/> {userProfile.averageRating?.toFixed(1) || 'N/A'} Rating
                            </div>
                             <div className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                                <Briefcase size={16} className="text-primary-500"/> {userProfile.completedGigsCount || 0} Gigs Completed
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable Section - Placeholder */}
                <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setIsEditing(true)}>
                     <Edit size={20} />
                </button>
                 {isEditing && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Profile</h2>
                        {/* Edit form fields for name, bio, skills, profilePic */}
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field h-32" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Skills (comma-separated)</label>
                                <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="input-field" />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Profile Picture URL</label>
                                <input type="text" value={profilePic} onChange={(e) => setProfilePic(e.target.value)} className="input-field" />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="btn-primary">Save Changes</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {!isEditing && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
                        <p className="text-slate-600 whitespace-pre-line">{userProfile.bio || 'No bio provided.'}</p>
                    </div>
                )}
            </div>

            {/* User's Gigs Section */}
            {userGigs && userGigs.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900">Gigs Posted</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userGigs.map((gig) => (
                            <Link key={gig._id} to={`/gigs/${gig._id}`} className="card group hover:shadow-lg transition-shadow duration-300">
                                <h3 className="font-bold text-lg text-slate-900 mb-2 truncate">{gig.title}</h3>
                                <p className="text-sm text-slate-500 mb-3 h-16 overflow-hidden line-clamp-3">{gig.description}</p>
                                <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100">
                                    <div className="text-sm font-medium text-slate-700 flex items-center">
                                        <IndianRupee size={16} className="mr-0.5 text-primary-500" /> ₹{gig.budget.toLocaleString()}
                                    </div>
                                    <span className={clsx(
                                        "text-xs font-bold px-2 py-0.5 rounded-full",
                                        gig.status === 'open' ? "bg-green-100 text-green-700" :
                                            gig.status === 'assigned' ? "bg-primary-100 text-primary-700" :
                                                "bg-slate-100 text-slate-600"
                                    )}>
                                        {gig.status.toUpperCase()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* User's Bids Section */}
            {userBids && userBids.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900">Bids Submitted</h2>
                    <div className="card p-6 bg-white border-0 shadow-lg">
                        <ul className="space-y-4">
                            {userBids.map((bid) => (
                                <li key={bid._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg text-slate-900">₹{bid.price}</span>
                                            <span className={clsx(
                                                "text-xs font-bold px-2 py-0.5 rounded-full",
                                                bid.status === 'hired' ? "bg-green-100 text-green-800" :
                                                    bid.status === 'rejected' ? "bg-red-100 text-red-800" : "bg-slate-200 text-slate-700"
                                            )}>
                                                {bid.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-700 mb-2">on Gig: {bid.gigId?.title || 'N/A'}</div>
                                        <p className="text-slate-600 text-sm bg-white p-3 rounded-lg border border-slate-100 italic">"{bid.message}"</p>
                                    </div>
                                    {bid.status === 'pending' && (
                                        <Link to={`/gigs/${bid.gigId._id}`} className="btn-secondary whitespace-nowrap">View Gig</Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
