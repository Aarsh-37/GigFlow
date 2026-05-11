import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { ArrowLeft, IndianRupee, Calendar, User, CheckCircle, XCircle, Clock, Briefcase, DollarSign, Award, Edit, Trash2 } from 'lucide-react'; // Added Trash2 icon
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { fetchUserGigs, fetchUserBids, withdrawBid } from '../slices/profileSlice'; // Import withdrawBid thunk
import { fetchUserProfile } from '../slices/profileSlice'; // Assuming a slice for user profile details
import { deleteGig } from '../slices/gigSlice'; // Import deleteGig thunk

const Profile = () => {
    const { id } = useParams(); // Could use this if profile route was /users/:id/profile
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    // Assuming profileSlice manages userProfile, userGigs, userBids, status, error
    const { userProfile, userGigs, userBids, status, error } = useSelector((state) => state.profile);

    // State for local management if needed, e.g., for editing
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState(''); // Input as string, split later
    const [profilePic, setProfilePic] = useState('');

    // State for managing gig editing/deletion and bid withdrawal
    const [editingGigId, setEditingGigId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmWithdrawId, setConfirmWithdrawId] = useState(null); // State for bid withdrawal confirmation

    // Determine which user profile to fetch: logged-in user's or another user's
    // For now, assume we are always viewing the logged-in user's profile via /profile route
    const userIdToFetch = userInfo?._id; // Use logged-in user's ID

    useEffect(() => {
        if (userIdToFetch) {
            // Dispatch thunks to fetch data
            dispatch(fetchUserProfile(userIdToFetch));
            dispatch(fetchUserGigs(userIdToFetch));
            dispatch(fetchUserBids(userIdToFetch));
        } else {
            // If no userInfo, redirect to login
            navigate('/login');
        }
    }, [dispatch, userIdToFetch, navigate]);

    // Handle loading and error states
    if (status === 'loading') {
        return <div className="text-center text-lg text-gray-500">Loading profile...</div>;
    }
    if (status === 'failed') {
        return <div className="text-center text-lg text-red-500 font-bold">Error: {error || 'Could not load profile'}</div>;
    }
    if (!userProfile) { // Should ideally be caught by 'failed' or 'loading' state
        return <div className="text-center text-lg text-gray-500">Profile not found.</div>;
    }

    // Prepare skills for display/editing
    const skillsArray = Array.isArray(userProfile.skills) ? userProfile.skills : (userProfile.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const skillsString = skillsArray.join(', ');

    // Initialize editing state if editing is initiated
    useEffect(() => {
        if (isEditing) {
            setName(userProfile.name);
            setBio(userProfile.bio);
            setSkills(skillsString);
            setProfilePic(userProfile.profilePic);
        }
    }, [isEditing, userProfile, skillsString]);

    // Placeholder for save changes functionality
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        // TODO: Implement API call to update profile
        toast.info('Save changes functionality not yet implemented.');
        setIsEditing(false); // Exit editing mode
    };

    const handleDeleteGig = async (gigId) => {
        if (window.confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
            try {
                await api.delete(`/gigs/${gigId}`);
                toast.success('Gig deleted successfully!');
                // Refresh the user's gigs list after deletion
                dispatch(fetchUserGigs(userIdToFetch));
                setConfirmDeleteId(null); // Close confirmation
            } catch (err) {
                toast.error(err.response?.data?.message || 'Error deleting gig');
            }
        }
    };

    // Function to handle withdrawing a bid
    const handleWithdrawBid = async (bidId) => {
        if (window.confirm('Are you sure you want to withdraw this bid?')) {
            try {
                await api.delete(`/bids/${bidId}`);
                toast.success('Bid withdrawn successfully!');
                // Refresh the user's bids list after withdrawal
                dispatch(fetchUserBids(userIdToFetch));
                setConfirmWithdrawId(null); // Close confirmation
            } catch (err) {
                toast.error(err.response?.data?.message || 'Error withdrawing bid');
            }
        }
    };

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

                {/* Editable Section */}
                {isEditing ? (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Profile</h2>
                        <form onSubmit={handleSaveChanges} className="space-y-4">
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
                ) : (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">About</h2>
                            <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setIsEditing(true)}>
                                <Edit size={20} />
                            </button>
                        </div>
                        <p className="text-slate-600 whitespace-pre-line">{userProfile.bio || 'No bio provided.'}</p>
                        <div className="mt-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Skills</h3>
                            {skillsArray.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {skillsArray.map(skill => (
                                        <span key={skill} className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">{skill}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 italic">No skills listed.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* User's Gigs Section */}
            {userGigs && userGigs.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900">Gigs Posted</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userGigs.map((gig) => (
                            <div key={gig._id} className="card group hover:shadow-lg transition-shadow duration-300 flex flex-col"> {/* Changed Link to div */}
                                <Link to={`/gigs/${gig._id}`} className="flex-grow"> {/* Link wraps content */}
                                    <h3 className="font-bold text-lg text-slate-900 mb-2 truncate">{gig.title}</h3>
                                    <p className="text-sm text-slate-500 mb-3 h-16 overflow-hidden line-clamp-3">{gig.description}</p>
                                </Link>
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
                                    {/* Edit and Delete Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingGigId(gig._id)} className="text-blue-500 hover:text-blue-700">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => setConfirmDeleteId(gig._id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                {/* Delete Confirmation Modal/Overlay */}
                                {confirmDeleteId === gig._id && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white p-6 rounded-lg shadow-lg">
                                            <h3 className="text-lg font-bold text-red-600 mb-4">Confirm Deletion</h3>
                                            <p>Are you sure you want to delete this gig? This action cannot be undone.</p>
                                            <div className="flex justify-end gap-4 mt-4">
                                                <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary">Cancel</button>
                                                <button onClick={() => {
                                                    dispatch(deleteGig(gig._id));
                                                    // Optionally refresh gigs list or handle UI update after deletion
                                                    // For now, just close confirmation and show toast via deleteGig thunk
                                                    setConfirmDeleteId(null);
                                                }} className="btn-danger">Delete Gig</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Edit Gig Modal/Overlay - Placeholder */}
                                {editingGigId === gig._id && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                                            <h3 className="text-lg font-bold text-primary-600 mb-4">Edit Gig</h3>
                                            {/* TODO: Add form for editing gig details */}
                                            <p>Editing form for gig {gig._id} will go here.</p>
                                            <div className="flex justify-end gap-4 mt-4">
                                                <button onClick={() => setEditingGigId(null)} className="btn-secondary">Cancel</button>
                                                {/* <button onClick={() => handleSaveGigEdit(gig._id)} className="btn-primary">Save Changes</button> */}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                        <div className="flex items-center gap-2"> {/* Added div for button alignment */}
                                            <button
                                                onClick={() => setConfirmWithdrawId(bid._id)}
                                                className="btn-secondary whitespace-nowrap"
                                            >
                                                Withdraw Bid
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {/* Bid Withdrawal Confirmation */}
            {confirmWithdrawId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold text-red-600 mb-4">Confirm Withdrawal</h3>
                        <p>Are you sure you want to withdraw this bid? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setConfirmWithdrawId(null)} className="btn-secondary">Cancel</button>
                            <button onClick={() => handleWithdrawBid(confirmWithdrawId)} className="btn-danger">Withdraw Bid</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
