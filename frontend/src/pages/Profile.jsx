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
import { setCredentials } from '../slices/authSlice';
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
            const { data } = await api.patch('/users/profile', updatedData);
            dispatch(setCredentials(data));
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
        <div className="max-w-6xl mx-auto px-4 py-8 relative">
            {/* Header / Banner Area */}
            <div className="relative mb-24">
                <div className="h-48 md:h-64 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-400 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl"></div>
                    </div>
                </div>
                
                <div className="absolute -bottom-16 left-8 flex flex-col md:flex-row items-end gap-6 w-full pr-16">
                    <div className="relative group">
                        {userProfile.avatar ? (
                            <img 
                                src={userProfile.avatar} 
                                alt={userProfile.name} 
                                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white dark:border-dark-bg shadow-2xl object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white dark:border-dark-bg shadow-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 font-black text-5xl">
                                {userProfile.name?.charAt(0)}
                            </div>
                        )}
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-brand-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Edit size={16} />
                        </button>
                    </div>
                    
                    <div className="flex-grow pb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                                    {userProfile.name}
                                    <ShieldCheck size={24} className="text-brand-600" />
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2 mt-1">
                                    <Mail size={16} /> {userProfile.email}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
                                >
                                    <Edit size={18} /> Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Stats & Social */}
                <div className="space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-6 rounded-3xl text-center">
                            <Star className="text-yellow-400 mx-auto mb-2" fill="currentColor" size={24} />
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{userProfile.rating?.toFixed(1) || '0.0'}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Rating</p>
                        </div>
                        <div className="glass p-6 rounded-3xl text-center">
                            <Briefcase className="text-brand-600 mx-auto mb-2" size={24} />
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{userProfile.totalGigs || 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Gigs</p>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="glass p-8 rounded-3xl space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Connect</h3>
                        <div className="space-y-4">
                            {userProfile.linkedin && (
                                <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-brand-600 transition-colors group">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-brand-50 transition-colors">
                                        <Linkedin size={20} />
                                    </div>
                                    <span className="text-sm font-bold">LinkedIn Profile</span>
                                    <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            )}
                            {userProfile.github && (
                                <a href={userProfile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-brand-600 transition-colors group">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-brand-50 transition-colors">
                                        <Github size={20} />
                                    </div>
                                    <span className="text-sm font-bold">GitHub Portfolio</span>
                                    <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            )}
                            {userProfile.twitter && (
                                <a href={userProfile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-brand-600 transition-colors group">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-brand-50 transition-colors">
                                        <Twitter size={20} />
                                    </div>
                                    <span className="text-sm font-bold">Twitter / X</span>
                                    <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Bio & Skills */}
                    <div className="glass p-10 rounded-[40px] shadow-sm border border-white/20">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Avatar URL</label>
                                        <input 
                                            type="text" 
                                            value={formData.avatar} 
                                            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                                            className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Professional Bio</label>
                                    <textarea 
                                        rows="4"
                                        value={formData.bio} 
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white font-bold"
                                    ></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Skills (Comma separated)</label>
                                    <input 
                                        type="text" 
                                        value={formData.skills} 
                                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white font-bold"
                                        placeholder="React, Node.js, UI/UX..."
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all">Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-600 mb-6">About Me</h2>
                                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium mb-10">
                                    {userProfile.bio || "Crafting digital experiences and solving complex problems. Ready to collaborate on your next big project."}
                                </p>
                                
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Core Expertise</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {skills.length > 0 ? skills.map(skill => (
                                            <span key={skill} className="px-5 py-2.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-2xl text-sm font-black border border-brand-100/50 dark:border-brand-900/50">
                                                {skill}
                                            </span>
                                        )) : (
                                            <p className="text-gray-500 text-sm italic">Skills are being refined...</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Work Portfolio / Experience */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Recent Projects</h2>
                            <Link to="/gigs" className="text-sm font-bold text-brand-600 hover:underline">View All Market</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userGigs?.length > 0 ? userGigs.map((gig, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={gig._id} 
                                    className="glass p-6 rounded-[32px] group hover:border-brand-500/30 transition-all duration-500"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform duration-500">
                                            <Briefcase size={24} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                                            gig.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {gig.status}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">{gig.title}</h4>
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center gap-1 text-brand-600 font-black">
                                            <IndianRupee size={14} />
                                            <span>{gig.budget?.toLocaleString()}</span>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/gigs/${gig._id}`)}
                                            className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all"
                                        >
                                            <ExternalLink size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="col-span-full py-16 text-center glass rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800">
                                    <p className="text-gray-500 font-bold">No projects posted yet.</p>
                                    <Link to="/gigs/create" className="text-brand-600 font-black mt-2 inline-block">Post Your First Project</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
