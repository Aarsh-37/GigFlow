import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Users, FileText, Trash2, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('users');

    // Fetch Users
    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await api.get('/admin/users');
            return data;
        },
        enabled: userInfo?.role === 'admin',
    });

    // Fetch Gigs
    const { data: gigs = [], isLoading: gigsLoading } = useQuery({
        queryKey: ['admin-gigs'],
        queryFn: async () => {
            const { data } = await api.get('/admin/gigs');
            return data;
        },
        enabled: userInfo?.role === 'admin',
    });

    // Delete Gig Mutation
    const deleteGigMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/gigs/${id}`),
        onSuccess: () => {
            toast.success('Gig deleted');
            queryClient.invalidateQueries(['admin-gigs']);
        },
        onError: () => {
            toast.error('Failed to delete gig');
        }
    });

    const handleDeleteGig = (id) => {
        if (window.confirm('Are you sure you want to delete this gig?')) {
            deleteGigMutation.mutate(id);
        }
    };

    if (userInfo?.role !== 'admin') return (
        <div className="text-center py-20">
            <Shield size={64} className="mx-auto text-red-100 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
            <p className="text-slate-500">You must be an administrator to view this page.</p>
        </div>
    );

    const isLoading = usersLoading || gigsLoading;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Admin Control Center</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-bold">Platform-wide moderation and oversight</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Users size={18} /> Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('gigs')}
                        className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'gigs' ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <FileText size={18} /> Gigs ({gigs.length})
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Management Data...</p>
                </div>
            ) : activeTab === 'users' ? (
                <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 uppercase text-[10px] font-black text-gray-400 tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5">User Profile</th>
                                    <th className="px-8 py-5">System Role</th>
                                    <th className="px-8 py-5">Member Since</th>
                                    <th className="px-8 py-5 text-right">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 dark:text-white text-lg">{user.name}</div>
                                                    <div className="text-xs text-gray-400 font-bold">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                                user.role === 'hirer' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-brand-600 font-black text-sm">{user.totalGigs || 0} Gigs</span>
                                                <span className="text-yellow-500 font-black text-xs">{user.rating?.toFixed(1) || '0.0'} ★</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 uppercase text-[10px] font-black text-gray-400 tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-5">Internship Details</th>
                                    <th className="px-8 py-5">Organization / Owner</th>
                                    <th className="px-8 py-5">Current Status</th>
                                    <th className="px-8 py-5 text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {gigs.map(gig => (
                                    <tr key={gig._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-black text-gray-900 dark:text-white text-lg group-hover:text-brand-600 transition-colors">{gig.title}</div>
                                            <div className="text-xs text-brand-600 font-black uppercase tracking-widest mt-1">₹{gig.budget.toLocaleString()} Stipend</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-gray-700 dark:text-gray-300">{gig.ownerId?.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold italic">{gig.ownerId?.email}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                gig.status === 'open' ? 'bg-green-100 text-green-700' :
                                                gig.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-brand-100 text-brand-700'
                                            }`}>
                                                {gig.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleDeleteGig(gig._id)}
                                                disabled={deleteGigMutation.isLoading}
                                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                                                title="Delete Gig"
                                            >
                                                {deleteGigMutation.isLoading && deleteGigMutation.variables === gig._id ? (
                                                    <Loader2 className="animate-spin" size={20} />
                                                ) : (
                                                    <Trash2 size={20} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
