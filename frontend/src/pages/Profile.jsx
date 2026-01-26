import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import api from '../utils/api';
import { User, Mail, FileText, Code, Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        skills: '',
        profilePic: ''
    });

    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || '',
                email: userInfo.email || '',
                bio: userInfo.bio || '',
                skills: userInfo.skills ? userInfo.skills.join(', ') : '',
                profilePic: userInfo.profilePic || ''
            });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
            const { data } = await api.patch('/users/profile', {
                ...formData,
                skills: skillsArray
            });
            dispatch(setCredentials(data));
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-indigo-600 h-32 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                    {formData.profilePic ? (
                                        <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} className="text-slate-300" />
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-lg shadow-md text-slate-500 hover:text-primary-600 transition-colors border border-slate-100">
                                <Camera size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-16 px-8 pb-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{userInfo.name}</h1>
                            <p className="text-slate-500">{userInfo.email}</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-center">
                                <div className="text-xl font-bold text-primary-600">{userInfo.completedGigsCount || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-primary-600">{userInfo.averageRating || '0.0'}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400">Rating</div>
                            </div>
                            <div className="text-center pl-4 border-l border-slate-100">
                                <div className="text-xl font-bold text-emerald-600">₹{userInfo.balance?.toLocaleString() || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400">Balance</div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Your Display Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Mail size={16} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="input-field bg-slate-50 text-slate-400 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <FileText size={16} /> Professional Bio
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                className="input-field resize-none"
                                placeholder="Tell us about yourself and your expertise..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <Code size={16} /> Skills (comma separated)
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="React, Node.js, Design, Typing..."
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center gap-2 px-8 py-3"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Save size={20} />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
