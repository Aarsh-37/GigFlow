import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Users, FileText, Trash2, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const [users, setUsers] = useState([]);
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, gigsRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/gigs')
                ]);
                setUsers(usersRes.data);
                setGigs(gigsRes.data);
            } catch (error) {
                toast.error('Failed to fetch admin data');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleDeleteGig = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gig?')) return;
        try {
            await api.delete(`/admin/gigs/${id}`);
            setGigs(gigs.filter(g => g._id !== id));
            toast.success('Gig deleted');
        } catch (error) {
            toast.error('Failed to delete gig');
        }
    };

    if (userInfo?.role !== 'admin') return (
        <div className="text-center py-20">
            <Shield size={64} className="mx-auto text-red-100 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
            <p className="text-slate-500">You must be an administrator to view this page.</p>
        </div>
    );

    if (loading) return <div className="p-8 text-center">Loading Admin Data...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
                    <p className="text-slate-500 mt-1">Platform-wide moderation and oversight</p>
                </div>
                <div className="flex bg-slate-200/50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Users size={16} className="inline mr-2" /> Users ({users.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('gigs')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'gigs' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText size={16} className="inline mr-2" /> Gigs ({gigs.length})
                    </button>
                </div>
            </div>

            {activeTab === 'users' ? (
                <div className="card overflow-hidden border-0 shadow-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-400 tracking-widest">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Stats</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{user.name}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-4 text-xs font-bold">
                                            <span className="text-primary-600">{user.completedGigsCount} Jobs</span>
                                            <span className="text-yellow-600">{user.averageRating} ★</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card overflow-hidden border-0 shadow-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-400 tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Gig Title</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {gigs.map(gig => (
                                <tr key={gig._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{gig.title}</div>
                                        <div className="text-xs text-slate-500 font-medium">Budget: ₹{gig.budget}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700">{gig.ownerId?.name}</div>
                                        <div className="text-[10px] text-slate-400 italic">{gig.ownerId?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${gig.status === 'open' ? 'bg-green-100 text-green-700' :
                                            gig.status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-primary-100 text-primary-700'
                                            }`}>
                                            {gig.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDeleteGig(gig._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete Gig"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
