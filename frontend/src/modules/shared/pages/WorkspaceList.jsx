import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import api from '../../../utils/api';
import { Loader2, Briefcase, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const statusColors = {
    assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const WorkspaceList = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const { data: workspaces = [], isLoading, isError } = useQuery({
        queryKey: ['workspace-list'],
        queryFn: async () => {
            const { data } = await api.get('/workspaces');
            return data || [];
        },
    });

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                    My Workspaces
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {userInfo?.role === 'hirer'
                        ? 'Projects where you have hired interns.'
                        : 'Projects you are working on.'}
                </p>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                    <p className="text-gray-500 font-bold">Failed to load workspaces.</p>
                </div>
            )}

            {!isLoading && !isError && workspaces.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                    <Briefcase className="w-14 h-14 text-gray-300 mb-5" />
                    <h3 className="text-xl font-black text-gray-700 dark:text-gray-300 mb-2">No active workspaces</h3>
                    <p className="text-gray-400 text-sm max-w-xs">
                        {userInfo?.role === 'hirer'
                            ? 'Hire an intern on a gig to unlock a workspace.'
                            : 'You will see your workspace once a hirer hires you.'}
                    </p>
                </div>
            )}

            {!isLoading && workspaces.length > 0 && (
                <div className="space-y-4">
                    {workspaces.map((gig, idx) => (
                        <motion.div
                            key={gig._id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                        >
                            {/* Left */}
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors shrink-0">
                                    <Briefcase size={26} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {gig.title}
                                    </h2>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${statusColors[gig.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {gig.status.replace('-', ' ')}
                                        </span>
                                        {gig.deadline && (
                                            <span className="flex items-center gap-1 text-xs text-gray-400 font-bold">
                                                <Clock size={12} />
                                                Deadline: {new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                        {userInfo?.role === 'hirer' && gig.hiredInternId && (
                                            <span className="text-xs text-gray-400 font-bold">
                                                Intern: <span className="text-gray-600 dark:text-gray-300">{gig.hiredInternId.name}</span>
                                            </span>
                                        )}
                                        {userInfo?.role === 'intern' && gig.ownerId && (
                                            <span className="text-xs text-gray-400 font-bold">
                                                Client: <span className="text-gray-600 dark:text-gray-300">{gig.ownerId.name}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <Link
                                to={`/workspace/${gig._id}`}
                                className="ml-4 shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                Open Workspace
                                <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkspaceList;
