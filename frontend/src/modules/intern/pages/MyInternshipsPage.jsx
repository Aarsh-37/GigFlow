import React from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { IndianRupee, Trash2, Edit3, Clock, Loader2, Briefcase } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

const MyInternshipsPage = () => {
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    const { data: myGigs = [], isLoading, isError, error } = useQuery({
        queryKey: ['my-gigs', userInfo?._id],
        queryFn: async () => {
            const { data } = await api.get(`/users/${userInfo._id}/gigs`);
            return data;
        },
        enabled: !!userInfo,
    });

    const deleteMutation = useMutation({
        mutationFn: (gigId) => api.delete(`/gigs/${gigId}`),
        onSuccess: () => {
            toast.success('Internship deleted successfully!');
            queryClient.invalidateQueries(['my-gigs', userInfo?._id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete internship.');
        }
    });

    const handleDeleteGig = (gigId, gigTitle) => {
        if (window.confirm(`Are you sure you want to delete the internship "${gigTitle}"? This action cannot be undone.`)) {
            deleteMutation.mutate(gigId);
        }
    };

    const MyGigsSkeleton = () => (
        <div className="animate-pulse max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mt-8 px-8 py-6">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
            <ul className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <li key={i} className="flex items-center justify-between p-4 bg-gray-200 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600">
                        <div className="flex-1">
                            <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </li>
                ))}
            </ul>
        </div>
    );

    if (isLoading) return <MyGigsSkeleton />;
    if (isError) return <div className="text-center text-red-500 p-8">Error: {error.message}</div>;
    if (!userInfo) return <div className="text-center text-slate-500 p-8">Please log in to view your internships.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">My Posted Internships</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold">Manage and track your active internship listings.</p>
                </div>
                <Link to="/gigs/create" className="btn-primary flex items-center gap-2">
                    Post New Internship
                </Link>
            </div>

            {myGigs.length === 0 ? (
                <div className="text-center py-32 bg-gray-50/50 dark:bg-gray-800/25 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="max-w-xs mx-auto">
                        <Briefcase className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Internships Found</h3>
                        <p className="text-gray-500 dark:text-gray-400">You haven't posted any internship opportunities yet.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myGigs.map((gig) => (
                        <div key={gig._id} className={clsx(
                            "bg-white dark:bg-dark-card rounded-3xl shadow-sm border p-6 flex flex-col justify-between transition-all duration-300",
                            gig.status === 'open' ? "border-green-100 dark:border-green-900/30" :
                            gig.status === 'assigned' ? "border-blue-100 dark:border-blue-900/30" :
                            gig.status === 'in-progress' ? "border-orange-100 dark:border-orange-900/30" :
                            "border-gray-100 dark:border-gray-800"
                        )}>
                            <div className="mb-4">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 hover:text-indigo-600 transition-colors">
                                    <Link to={`/gigs/${gig._id}`}>{gig.title}</Link>
                                </h2>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        gig.status === 'open' ? "bg-green-100 text-green-700" :
                                        gig.status === 'assigned' ? "bg-blue-100 text-blue-700" :
                                        "bg-gray-100 text-gray-700"
                                    )}>
                                        {gig.status.replace('-', ' ')}
                                    </span>
                                    <span className="text-sm font-bold text-gray-500 flex items-center gap-1">
                                        <IndianRupee size={14} className="text-indigo-600" /> {gig.budget.toLocaleString()}
                                    </span>
                                </div>
                                {gig.deadline && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                                        <Clock size={14} /> Deadline: {new Date(gig.deadline).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Posted {new Date(gig.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/gigs/create?edit=${gig._id}`)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                        title="Edit Internship"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGig(gig._id, gig.title)}
                                        disabled={deleteMutation.isLoading}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                        title="Delete Internship"
                                    >
                                        {deleteMutation.isLoading && deleteMutation.variables === gig._id ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyInternshipsPage;
