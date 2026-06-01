import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { ArrowLeft, IndianRupee, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateGig = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [category, setCategory] = useState('');
    const [bidDeadline, setBidDeadline] = useState('');
    
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createGigMutation = useMutation({
        mutationFn: (gigData) => api.post('/gigs', gigData),
        onSuccess: () => {
            toast.success('Internship posted successfully!');
            queryClient.invalidateQueries(['gigs']);
            queryClient.invalidateQueries(['my-gigs']);
            navigate('/dashboard');
        },
        onError: (err) => {
            const errorMsg = err.response?.data?.errors 
                ? err.response.data.errors.map(e => `${e.path}: ${e.message}`).join(', ')
                : err.response?.data?.message || err.message;
            toast.error(errorMsg);
        }
    });

    const submitHandler = (e) => {
        e.preventDefault();
        createGigMutation.mutate({ 
            title, 
            description, 
            budget: Number(budget), 
            category, 
            deadline: bidDeadline,
            tags: [] // Add empty tags array to satisfy strict schema
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center text-slate-500 hover:text-slate-900 transition-colors font-bold"
            >
                <ArrowLeft size={18} className="mr-1" /> Back
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Post a New Internship</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Describe the role and stipend to attract top interns.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 shadow-sm border border-gray-100 dark:border-gray-700 rounded-3xl">
                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Internship Title</label>
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
                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Description</label>
                        <textarea
                            required
                            className="input-field h-32 resize-none"
                            placeholder="Describe the internship role, responsibilities, and perks..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Stipend (₹)</label>
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
                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Category</label>
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
                        <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">Application Deadline (Optional)</label>
                        <input
                            type="date"
                            className="input-field"
                            value={bidDeadline}
                            onChange={(e) => setBidDeadline(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-bold uppercase tracking-widest">Gigs will automatically stop accepting applications after this date.</p>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={createGigMutation.isLoading}
                            className="w-full btn-primary py-4 text-lg font-black flex justify-center items-center gap-2"
                        >
                            {createGigMutation.isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Posting...
                                </>
                            ) : 'Post Internship Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGig;
