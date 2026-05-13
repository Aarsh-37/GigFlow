import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
    ArrowLeft, IndianRupee, Briefcase, Star, Edit, Trash2, 
    Linkedin, Github, Twitter, MapPin, Mail, ExternalLink,
    CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';
import { fetchUserGigs, fetchUserBids, fetchUserProfile } from '../slices/profileSlice';
import { deleteGig } from '../slices/gigSlice';
import { ProfileSkeleton } from '../components/common/Skeleton';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const { userProfile, userGigs, userBids, status, error } = useSelector((state) => state.profile);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        skills: '',
        avatar: '',
        linkedin: '',
        github: '',
        twitter: ''
    });

    useEffect(() => {
        if (userInfo?._id) {
            dispatch(fetchUserProfile(userInfo._id));
            dispatch(fetchUserGigs(userInfo._id));
            dispatch(fetchUserBids(userInfo._id));
        } else {
            navigate('/login');
        }
    }, [dispatch, userInfo?._id, navigate]);

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                bio: userProfile.bio || '',
                skills: (userProfile.skills || []).join(', '),
                avatar: userProfile.avatar || '',
                linkedin: userProfile.linkedin || '',
                github: userProfile.github || '',
                twitter: userProfile.twitter || ''
            });
        }
    }, [userProfile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
            };
            await api.put('/auth/me', updatedData);
            toast.success('Profile updated successfully');
            setIsEditing(false);
            dispatch(fetchUserProfile(userInfo._id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        }
    };

    if (status === 'loading') return <ProfileSkeleton />;
    if (status === 'failed') return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!userProfile) return null;

    const skills = userProfile.skills || [];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="h-24 bg-indigo-600"></div>
                        <div className="px-6 pb-8">
                            <div className="relative -mt-12 mb-4 flex justify-center lg:justify-start">
                                {userProfile.avatar ? (
                                    <img 
                                        src={userProfile.avatar} 
                                        alt={userProfile.name} 
                                        className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-4xl">
                                        {userProfile.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="text-center lg:text-left">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">{userProfile.email}</p>
                                
                                <div className="flex justify-center lg:justify-start gap-4 mb-6">
                                    <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                                        <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                                            <Star size={14} className="text-yellow-400 fill-current" />
                                            {userProfile.rating?.toFixed(1) || '0.0'}
                                        </div>
                                    </div>
                                    <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Gigs</p>
                                        <p className="font-bold text-gray-900 dark:text-white">{userProfile.totalGigs || 0}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <ShieldCheck size={18} className="text-green-500" />
                                        <span className="text-sm">Verified Professional</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <Mail size={18} />
                                        <span className="text-sm truncate">{userProfile.email}</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-center lg:justify-start gap-4">
                                    {userProfile.linkedin && (
                                        <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                                            <Linkedin size={20} />
                                        </a>
                                    )}
                                    {userProfile.github && (
                                        <a href={userProfile.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 transition-colors">
                                            <Github size={20} />
                                        </a>
                                    )}
                                    {userProfile.twitter && (
                                        <a href={userProfile.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors">
                                            <Twitter size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio & Activities */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Bio</h2>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                <Edit size={20} />
                            </button>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                                        <input 
                                            type="text" 
                                            value={formData.avatar} 
                                            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                    <textarea 
                                        rows="4"
                                        value={formData.bio} 
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Skills (Comma separated)</label>
                                    <input 
                                        type="text" 
                                        value={formData.skills} 
                                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-bold">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                                    {userProfile.bio || "No professional bio available yet. Click edit to add your story."}
                                </p>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Core Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.length > 0 ? skills.map(skill => (
                                            <span key={skill} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-bold">
                                                {skill}
                                            </span>
                                        )) : (
                                            <p className="text-gray-500 text-sm italic">No skills listed yet.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tabs for Gigs and Bids */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Management</h2>
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Briefcase size={20} className="text-indigo-600" /> My Posted Gigs
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userGigs?.length > 0 ? userGigs.map(gig => (
                                    <div key={gig._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 truncate">{gig.title}</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-indigo-600 font-bold flex items-center">
                                                <IndianRupee size={14} /> {gig.budget}
                                            </span>
                                            <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                                                gig.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {gig.status}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/gigs/${gig._id}`)}
                                                className="text-xs text-gray-500 hover:text-indigo-600 font-bold"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-10 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-500">You haven't posted any gigs yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Star size={20} className="text-yellow-500" /> My Active Bids
                            </h3>
                            <div className="space-y-4">
                                {userBids?.length > 0 ? userBids.map(bid => (
                                    <div key={bid._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{bid.gigId?.title}</h4>
                                            <p className="text-sm text-gray-500 mb-2 truncate max-w-md">{bid.message}</p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-indigo-600 font-bold flex items-center text-sm">
                                                    <IndianRupee size={14} /> {bid.price}
                                                </span>
                                                <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                                                    bid.status === 'hired' ? 'bg-green-100 text-green-700' : 
                                                    bid.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {bid.status}
                                                </span>
                                            </div>
                                        </div>
                                        {bid.status === 'pending' && (
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm('Withdraw this bid?')) {
                                                        try {
                                                            await api.patch(`/bids/${bid._id}/withdraw`);
                                                            toast.success('Bid withdrawn');
                                                            dispatch(fetchUserBids(userInfo._id));
                                                        } catch (err) {
                                                            toast.error('Failed to withdraw');
                                                        }
                                                    }
                                                }}
                                                className="self-center px-4 py-2 text-sm text-red-500 font-bold hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                    </div>
                                )) : (
                                    <div className="py-10 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-500">No active bids.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
