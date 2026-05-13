import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Assuming api utility is set up
import { toast } from 'react-hot-toast';
import { IndianRupee, Calendar, User, Briefcase, Star, Linkedin, Github, Twitter, X } from 'lucide-react'; // Import X for close icon

const EditProfileForm = ({ profile, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        skills: [],
        avatar: '', // For profile picture URL
        linkedin: '',
        github: '',
        twitter: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || '',
                bio: profile.bio || '',
                skills: profile.skills || [],
                avatar: profile.profilePic || '',
                linkedin: profile.linkedin || '',
                github: profile.github || '',
                twitter: profile.twitter || ''
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillsChange = (e) => {
        setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Assuming an API endpoint like PUT /api/users/me to update profile
            const response = await api.put('/auth/me', formData); // Need to confirm backend endpoint
            onSave(response.data); // Pass updated profile data back
            toast.success('Profile updated successfully!');
            onClose();
        } catch (err) {
            console.error("Error updating profile:", err);
            const errorMessage = err.response?.data?.message || 'Failed to update profile.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="5"
                                    className="input-field"
                                    placeholder="Tell us about yourself..."
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                                <input
                                    type="text"
                                    id="skills"
                                    name="skills"
                                    value={formData.skills.join(', ')}
                                    onChange={handleSkillsChange}
                                    className="input-field"
                                    placeholder="e.g., JavaScript, React, Node.js"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <div className="mb-4">
                                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                                <input
                                    type="url"
                                    id="avatar"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
                                <input
                                    type="url"
                                    id="linkedin"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile URL</label>
                                <input
                                    type="url"
                                    id="github"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://github.com/yourusername"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">Twitter Profile URL</label>
                                <input
                                    type="url"
                                    id="twitter"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="https://twitter.com/yourhandle"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary mr-4"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileForm;
