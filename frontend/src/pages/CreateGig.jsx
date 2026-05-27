import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, IndianRupee } from 'lucide-react';

const CreateGig = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [category, setCategory] = useState('');
    const [bidDeadline, setBidDeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/gigs', { 
                title, 
                description, 
                budget: Number(budget), 
                category, 
                deadline: bidDeadline,
                tags: [] // Add empty tags array to satisfy strict schema
            });
            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.errors 
                ? err.response.data.errors.map(e => `${e.path}: ${e.message}`).join(', ')
                : err.response?.data?.message || err.message;
            setError(errorMsg);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft size={18} className="mr-1" /> Back
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Post a New Internship</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Describe the role and stipend to attract top interns.</p>
            </div>

            <div className="card p-8 bg-white dark:bg-gray-800 border-0 shadow-lg shadow-slate-200/50 dark:shadow-black/30 rounded-2xl">
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Internship Title</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. React Frontend Intern needed..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                            required
                            className="input-field h-32 resize-none"
                            placeholder="Describe the internship role, responsibilities, and perks..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stipend (₹)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <IndianRupee size={18} />
                            </div>
                            <input
                                type="number"
                                required
                                className="input-field pl-10"
                                placeholder="5000"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                        <select
                            required
                            className="input-field"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select a category...</option>
                            <option value="Design">Design</option>
                            <option value="Development">Development</option>
                            <option value="Writing">Writing</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Application Deadline (Optional)</label>
                        <input
                            type="date"
                            className="input-field"
                            value={bidDeadline}
                            onChange={(e) => setBidDeadline(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">Internships will automatically stop accepting applications after this date.</p>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-lg"
                        >
                            {loading ? 'Posting...' : 'Post Internship Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGig;
