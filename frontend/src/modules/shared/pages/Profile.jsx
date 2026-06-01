import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Briefcase, Star, Edit, 
    Linkedin, Github, Twitter, Mail, ExternalLink,
    ShieldCheck, Loader2, Camera, Upload, X, ImageIcon,
    Trash2, AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { setCredentials } from '../../../slices/authSlice';
import { ProfileSkeleton } from '../../../components/common/Skeleton';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { userInfo } = useSelector((state) => state.auth);
    const fileInputRef = useRef(null);
    const bannerFileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        skills: '',
        linkedin: '',
        github: '',
        twitter: ''
    });

    // Avatar upload state
    const [avatarFile, setAvatarFile] = useState(null);       // File object
    const [avatarPreview, setAvatarPreview] = useState(null); // Local blob URL for preview
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Banner upload state
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // Delete gig state
    const [gigToDelete, setGigToDelete] = useState(null); // { _id, title }

    // Fetch User Profile
    const { data: userProfile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile', userInfo?._id],
        queryFn: async () => {
            // api.js interceptor already unwraps { success, message, data } → returns data directly
            const { data } = await api.get(`/users/${userInfo._id}`);
            return data;
        },
        enabled: !!userInfo?._id,
    });

    // Populate form when profile data loads
    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                bio: userProfile.bio || '',
                skills: (userProfile.skills || []).join(', '),
                linkedin: userProfile.linkedin || '',
                github: userProfile.github || '',
                twitter: userProfile.twitter || ''
            });
        }
    }, [userProfile]);

    // Cleanup blob URL on unmount or when preview changes
    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
            if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        };
    }, [avatarPreview, bannerPreview]);

    // Fetch User Content (Gigs or Applications)
    const isHirer = userInfo?.role === 'hirer' || userInfo?.role === 'admin';
    const { data: userContent = [], isLoading: contentLoading } = useQuery({
        queryKey: ['user-content', userInfo?._id],
        queryFn: async () => {
            if (isHirer) {
                const { data } = await api.get(`/users/${userInfo._id}/gigs`);
                return Array.isArray(data) ? data : [];
            } else {
                const { data } = await api.get('/applications/my-applications');
                return data?.applications || (Array.isArray(data) ? data : []);
            }
        },
        enabled: !!userInfo?._id,
    });

    // Mutation for updating profile text fields
    const updateProfileMutation = useMutation({
        mutationFn: (updatedData) => api.put('/auth/me', updatedData),
        onSuccess: (response) => {
            const updatedUser = response.data;
            if (updatedUser) dispatch(setCredentials(updatedUser));
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['profile', userInfo?._id] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        }
    });

    // Mutation for deleting a gig
    const deleteGigMutation = useMutation({
        mutationFn: (gigId) => api.delete(`/gigs/${gigId}`),
        onSuccess: () => {
            toast.success('Internship deleted successfully.');
            setGigToDelete(null);
            queryClient.invalidateQueries({ queryKey: ['user-content', userInfo?._id] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete internship.');
        }
    });

    // Handle avatar file selection — show preview immediately
    const handleAvatarFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type client-side
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            toast.error('Please select a JPG, PNG, WEBP, or GIF image.');
            return;
        }
        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB.');
            return;
        }

        setAvatarFile(file);
        // Revoke old preview URL
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // Upload avatar separately before / during save
    const uploadAvatarToServer = async () => {
        if (!avatarFile) return null;
        setIsUploadingAvatar(true);
        try {
            const formPayload = new FormData();
            formPayload.append('avatar', avatarFile);
            const response = await api.post('/users/upload-avatar', formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = response.data;
            if (updatedUser) dispatch(setCredentials(updatedUser));
            queryClient.invalidateQueries({ queryKey: ['profile', userInfo?._id] });
            setAvatarFile(null);
            setAvatarPreview(null);
            toast.success('Avatar uploaded!');
            return updatedUser?.avatar || null;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Avatar upload failed.');
            return null;
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Handle banner file selection
    const handleBannerFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate type client-side
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.type)) {
            toast.error('Please select a JPG, PNG, WEBP, or GIF image.');
            return;
        }
        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB.');
            return;
        }

        setBannerFile(file);
        if (bannerPreview) URL.revokeObjectURL(bannerPreview);
        setBannerPreview(URL.createObjectURL(file));
    };

    // Upload banner separately
    const uploadBannerToServer = async () => {
        if (!bannerFile) return null;
        setIsUploadingBanner(true);
        try {
            const formPayload = new FormData();
            formPayload.append('banner', bannerFile);
            const response = await api.post('/users/upload-banner', formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = response.data;
            if (updatedUser) dispatch(setCredentials(updatedUser));
            queryClient.invalidateQueries({ queryKey: ['profile', userInfo?._id] });
            setBannerFile(null);
            setBannerPreview(null);
            toast.success('Banner uploaded!');
            return updatedUser?.banner || null;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Banner upload failed.');
            return null;
        } finally {
            setIsUploadingBanner(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (avatarFile) {
            await uploadAvatarToServer();
        }
        if (bannerFile) {
            await uploadBannerToServer();
        }
        // Then save the rest of the profile fields
        const updatedData = {
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        };
        updateProfileMutation.mutate(updatedData);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setAvatarFile(null);
        if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); }
        setBannerFile(null);
        if (bannerPreview) { URL.revokeObjectURL(bannerPreview); setBannerPreview(null); }
        // Reset form to current profile values
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                bio: userProfile.bio || '',
                skills: (userProfile.skills || []).join(', '),
                linkedin: userProfile.linkedin || '',
                github: userProfile.github || '',
                twitter: userProfile.twitter || ''
            });
        }
    };

    if (!userInfo) {
        navigate('/login');
        return null;
    }

    if (profileLoading) return <ProfileSkeleton />;
    if (!userProfile) return <div className="text-center py-20 text-red-500 font-bold">Profile not found.</div>;

    const skills = userProfile.skills || [];
    const displayAvatar = avatarPreview || userProfile.avatar;
    const displayBanner = bannerPreview || userProfile.banner;
    const isSaving = updateProfileMutation.isPending || isUploadingAvatar || isUploadingBanner;

    return (
        <>
        <div className="max-w-6xl mx-auto px-4 py-8 relative">
            {/* Header / Banner Area */}
            <div className="relative mb-24">
                <div className="h-48 md:h-64 rounded-3xl overflow-hidden relative shadow-2xl group bg-gray-100 dark:bg-gray-800">
                    {displayBanner ? (
                        <img src={displayBanner} alt="Profile Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-brand-600 to-indigo-600 relative">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-400 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl"></div>
                            </div>
                        </div>
                    )}

                    {/* Banner Edit Overlay */}
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => bannerFileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-sm">
                                <Camera size={20} />
                                <span className="font-bold">Change Cover Photo</span>
                            </div>
                        </button>
                    )}
                </div>
                
                <div className="absolute -bottom-16 left-8 flex flex-col md:flex-row items-end gap-6 w-full pr-16">
                    {/* Avatar with click-to-edit in edit mode */}
                    <div className="relative group">
                        {displayAvatar ? (
                            <img 
                                src={displayAvatar} 
                                alt={userProfile.name} 
                                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white dark:border-dark-bg shadow-2xl object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white dark:border-dark-bg shadow-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 font-black text-5xl">
                                {userProfile.name?.charAt(0)}
                            </div>
                        )}

                        {/* Camera overlay — always visible in edit mode */}
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 rounded-3xl bg-black/50 flex flex-col items-center justify-center text-white gap-1 cursor-pointer transition-opacity"
                                title="Change photo"
                            >
                                <Camera size={24} />
                                <span className="text-xs font-bold">Change</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-brand-600 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Edit size={16} />
                            </button>
                        )}

                        {/* New photo badge */}
                        {avatarPreview && (
                            <div className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow">
                                NEW
                            </div>
                        )}
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

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFileChange}
            />
            <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleBannerFileChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Stats & Social */}
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-6 rounded-3xl text-center">
                            <Star className="text-yellow-400 mx-auto mb-2" fill="currentColor" size={24} />
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{userProfile.rating?.toFixed(1) || '0.0'}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Rating</p>
                        </div>
                        <div className="glass p-6 rounded-3xl text-center">
                            <Briefcase className="text-brand-600 mx-auto mb-2" size={24} />
                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                {userContent.length}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {isHirer ? 'Internships' : 'Applications'}
                            </p>
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
                            {!userProfile.linkedin && !userProfile.github && !userProfile.twitter && (
                                <p className="text-gray-400 text-sm italic">No social links added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Bio & Skills / Edit Form */}
                    <div className="glass p-10 rounded-[40px] shadow-sm border border-white/20">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">

                                {/* Avatar Upload Section */}
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                                        Profile Photo
                                    </label>
                                    <div className="flex items-center gap-6">
                                        {/* Preview thumbnail */}
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                                            {displayAvatar ? (
                                                <img src={displayAvatar} alt="Avatar preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={28} className="text-gray-400" />
                                            )}
                                        </div>

                                        {/* Drop zone / button */}
                                        <div className="flex-1">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full flex items-center justify-center gap-3 px-5 py-4 border-2 border-dashed border-brand-300 dark:border-brand-700 rounded-2xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all cursor-pointer font-bold"
                                            >
                                                <Upload size={20} />
                                                {avatarFile ? (
                                                    <span className="text-sm truncate max-w-[200px]">{avatarFile.name}</span>
                                                ) : (
                                                    <span className="text-sm">Click to upload photo</span>
                                                )}
                                            </button>
                                            <p className="text-xs text-gray-400 mt-2 ml-1">
                                                JPG, PNG, WEBP, GIF — max 5MB
                                            </p>
                                        </div>

                                        {/* Clear button */}
                                        {avatarFile && (
                                            <button
                                                type="button"
                                                onClick={() => { setAvatarFile(null); if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); } }}
                                                className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
                                                title="Remove selected photo"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white font-bold"
                                    />
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Professional Bio</label>
                                    <textarea 
                                        rows="4"
                                        value={formData.bio} 
                                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white font-bold"
                                        placeholder="Tell us about yourself..."
                                    ></textarea>
                                </div>

                                {/* Skills */}
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

                                {/* Social Links */}
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <h4 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4">Social Links</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Linkedin size={12}/> LinkedIn</label>
                                            <input 
                                                type="url" 
                                                value={formData.linkedin} 
                                                onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white text-sm font-medium"
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Github size={12}/> GitHub</label>
                                            <input 
                                                type="url" 
                                                value={formData.github} 
                                                onChange={(e) => setFormData({...formData, github: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white text-sm font-medium"
                                                placeholder="https://github.com/..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Twitter size={12}/> Twitter</label>
                                            <input 
                                                type="url" 
                                                value={formData.twitter} 
                                                onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white text-sm font-medium"
                                                placeholder="https://twitter.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {isSaving 
                                            ? <><Loader2 size={16} className="animate-spin" /> {isUploadingAvatar ? 'Uploading photo...' : 'Saving...'}</>
                                            : 'Save Changes'
                                        }
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-600 mb-6">About Me</h2>
                                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium mb-10">
                                    {userProfile.bio || "Passionate professional ready to contribute to innovative projects and grow through real-world experience."}
                                </p>
                                
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Core Expertise</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {skills.length > 0 ? skills.map(skill => (
                                            <span key={skill} className="px-5 py-2.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-2xl text-sm font-black border border-brand-100/50 dark:border-brand-900/50">
                                                {skill}
                                            </span>
                                        )) : (
                                            <p className="text-gray-500 text-sm italic">No skills added yet. Click Edit Profile to add some!</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                {isHirer ? "Posted Internships" : "My Applications"}
                            </h2>
                            <Link to="/gigs" className="text-sm font-bold text-brand-600 hover:underline">Browse Market</Link>
                        </div>

                        {contentLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="animate-spin text-brand-600" size={32} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {userContent.length > 0 ? userContent.map((item, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={item._id} 
                                        className="glass p-6 rounded-[32px] group hover:border-brand-500/30 transition-all duration-500"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform duration-500">
                                                <Briefcase size={24} />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                                                (item.status === 'open' || item.status === 'HIRED') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">
                                            {isHirer ? item.title : (item.gigId?.title || 'Gig Removed')}
                                        </h4>
                                        <div className="flex items-center justify-between mt-6">
                                            <button 
                                                onClick={() => navigate(`/gigs/${isHirer ? item._id : item.gigId?._id}`)}
                                                className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-all"
                                                disabled={!isHirer && !item.gigId?._id}
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                            {/* Delete button for hirers on open gigs */}
                                            {isHirer && item.status === 'open' && (
                                                <button
                                                    onClick={() => setGigToDelete({ _id: item._id, title: item.title })}
                                                    className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                                                    title="Delete internship"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full py-16 text-center glass rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-800">
                                        <p className="text-gray-500 font-bold">No items found yet.</p>
                                        {isHirer && <Link to="/gigs/create" className="text-brand-600 font-black mt-2 inline-block">Post Your First Internship</Link>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

            {/* Delete Gig Confirmation Modal */}
            <AnimatePresence>
                {gigToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                                    <AlertTriangle size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Delete Internship?</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone.</p>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                You are about to permanently delete{' '}
                                <span className="font-black text-gray-900 dark:text-white">"{gigToDelete.title}"</span>.
                                All associated applications will also be removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => deleteGigMutation.mutate(gigToDelete._id)}
                                    disabled={deleteGigMutation.isPending}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {deleteGigMutation.isPending
                                        ? <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                                        : <><Trash2 size={16} /> Delete Forever</>
                                    }
                                </button>
                                <button
                                    onClick={() => setGigToDelete(null)}
                                    disabled={deleteGigMutation.isPending}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-black hover:bg-gray-200 transition-all disabled:opacity-60"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Profile;
