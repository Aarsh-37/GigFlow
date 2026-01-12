import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, IndianRupee } from 'lucide-react';

const CreateGig = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/gigs', { title, description, budget });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
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
                <h1 className="text-3xl font-display font-bold text-slate-900">Post a New Gig</h1>
                <p className="text-slate-500 mt-1">Describe your project and budget to attract top talent.</p>
            </div>

            <div className="card p-8 bg-white border-0 shadow-lg shadow-slate-200/50">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. React Frontend Developer needed..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            required
                            className="input-field h-32 resize-none"
                            placeholder="Describe the project details, requirements, and deliverables..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Budget (₹)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <IndianRupee size={18} />
                            </div>
                            <input
                                type="number"
                                required
                                className="input-field pl-10"
                                placeholder="500"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-lg"
                        >
                            {loading ? 'Posting...' : 'Post Job Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGig;
