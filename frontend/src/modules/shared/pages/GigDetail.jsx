import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import { ArrowLeft, IndianRupee, Calendar, User, CheckCircle, ShieldCheck, Star, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import Chat from '../../../components/Chat';
import { motion, AnimatePresence } from 'framer-motion';

// ... Skeleton component stays the same ...
const GigDetailSkeleton = () => (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4 animate-pulse">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700"></div>
                <div className="h-40 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700"></div>
            </div>
            <div className="h-96 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700"></div>
        </div>
    </div>
);

const GigDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    // Application Form State
    const [coverLetter, setCoverLetter] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Review State
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    // Fetch Gig Details
    const { data: gig, isLoading: gigLoading } = useQuery({
        queryKey: ['gig', id],
        queryFn: async () => {
            const { data } = await api.get(`/gigs/${id}`);
            return data;
        }
    });

    // Fetch Applicants (only if owner)
    const isOwner = userInfo && gig?.ownerId && userInfo._id === gig.ownerId._id;
    const { data: applicationsResult, isLoading: appsLoading } = useQuery({
        queryKey: ['gig-applications', id],
        queryFn: async () => {
            const { data } = await api.get(`/applications/gig/${id}`);
            return data;
        },
        enabled: !!isOwner,
    });
    const applications = applicationsResult?.applications || [];

    // Check if current user has reviewed this gig
    const { data: hasReviewed } = useQuery({
        queryKey: ['user-review', userInfo?._id, id],
        queryFn: async () => {
            try {
                const { data: reviews } = await api.get(`/reviews/user/${userInfo._id}`);
                return reviews.some(review => review.gigId === id);
            } catch (e) {
                return false;
            }
        },
        enabled: !!userInfo,
    });

    // Mutations
    const applyMutation = useMutation({
        mutationFn: (applicationData) => api.post('/applications', applicationData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
        onSuccess: () => {
            toast.success('Application submitted successfully!');
            queryClient.invalidateQueries(['gig', id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to submit application.');
        }
    });

    const hireMutation = useMutation({
        mutationFn: (applicationId) => api.patch(`/applications/${applicationId}/status`, { status: 'HIRED' }),
        onSuccess: () => {
            toast.success('Intern hired!');
            queryClient.invalidateQueries(['gig', id]);
            queryClient.invalidateQueries(['gig-applications', id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Error hiring intern');
        }
    });

    const statusMutation = useMutation({
        mutationFn: (transition) => api.patch(`/gigs/${id}/${transition}`),
        onSuccess: (_, transition) => {
            toast.success(`Project updated to ${transition.replace('-', ' ')}`);
            queryClient.invalidateQueries(['gig', id]);
        },
        onError: () => {
            toast.error('Error updating project status.');
        }
    });

    const reviewMutation = useMutation({
        mutationFn: (reviewData) => api.post('/reviews', reviewData),
        onSuccess: () => {
            toast.success('Feedback submitted!');
            queryClient.invalidateQueries(['user-review', userInfo?._id, id]);
            queryClient.invalidateQueries(['gig', id]);
        },
        onError: () => {
            toast.error('Error submitting review');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.delete(`/gigs/${id}`),
        onSuccess: () => {
            toast.success('Internship deleted successfully.');
            queryClient.invalidateQueries({ queryKey: ['user-content'] });
            queryClient.invalidateQueries({ queryKey: ['gigs'] });
            navigate('/gigs');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete internship.');
            setShowDeleteConfirm(false);
        }
    });

    if (gigLoading) return <GigDetailSkeleton />;
    if (!gig) return <div className="text-center py-20 text-red-500 font-bold">Gig not found.</div>;

    const hiredApp = applications.find(a => a.status === 'HIRED');
    const isHiredIntern = !isOwner && userInfo && hiredApp && userInfo._id === hiredApp.internId._id;
    const isAssignedOrCompleted = gig.status !== 'open';

    const handleApply = (e) => {
        e.preventDefault();
        
        if (uploadType === 'file' && !resumeFile) {
            return toast.error('Please upload your resume file.');
        }
        if (uploadType === 'url' && !resumeUrl) {
            return toast.error('Please provide your resume URL.');
        }
        if (coverLetter.length < 20) {
            return toast.error('Cover letter must be at least 20 characters.');
        }

        const formData = new FormData();
        formData.append('gigId', id);
        formData.append('coverLetter', coverLetter);
        
        if (uploadType === 'file') {
            formData.append('resumeFile', resumeFile);
        } else {
            formData.append('resume', resumeUrl);
        }

        applyMutation.mutate(formData);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        const hiredApp = applications.find(a => a.status === 'HIRED');
        const revieweeId = isOwner && hiredApp ? hiredApp.internId._id : gig.ownerId._id;
        reviewMutation.mutate({
            gigId: id,
            revieweeId,
            rating: reviewRating,
            comment: reviewComment
        });
    };

    return (
        <>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-bold">
                    <ArrowLeft size={20} /> Back to explore
                </button>
                <div className={clsx(
                    "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest",
                    gig.status === 'open' ? "bg-green-100 text-green-700" :
                    gig.status === 'assigned' ? "bg-blue-100 text-blue-700" :
                    "bg-indigo-100 text-indigo-700"
                )}>
                    {gig.status.replace('-', ' ')}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">{gig.title}</h1>
                        <div className="flex flex-wrap gap-6 mb-10 text-sm font-bold text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2"><User size={18} className="text-indigo-600" /> {gig.ownerId.name}</div>
                            <div className="flex items-center gap-2"><Calendar size={18} className="text-indigo-600" /> {new Date(gig.createdAt).toLocaleDateString()}</div>
                            <div className="flex items-center gap-2 text-green-600"><IndianRupee size={18} /> Budget: ₹{gig.budget.toLocaleString()}</div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Project Brief</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">{gig.description}</p>
                        </div>
                    </motion.div>

                    {/* Chat or Applicants */}
                    {userInfo && (isOwner || isHiredIntern) && isAssignedOrCompleted ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <Chat gigId={id} />
                        </div>
                    ) : isOwner ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Applicants ({applications.length})</h2>
                            <div className="grid gap-4">
                                {appsLoading ? (
                                    <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32} /></div>
                                ) : applications.map(app => (
                                    <motion.div 
                                        key={app._id} 
                                        className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex justify-between items-center"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-black text-indigo-600">{app.internId.name}</span>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm italic">"{app.coverLetter}"</p>
                                            <a href={app.resume} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 font-bold hover:underline">View Resume</a>
                                        </div>
                                        {app.status === 'APPLIED' && (
                                            <button 
                                                onClick={() => hireMutation.mutate(app._id)}
                                                disabled={hireMutation.isLoading}
                                                className="btn-primary"
                                            >
                                                {hireMutation.isLoading && hireMutation.variables === app._id ? 'Hiring...' : 'Hire Now'}
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                                {!appsLoading && applications.length === 0 && <p className="text-center py-10 text-gray-400 font-bold">No applicants yet.</p>}
                            </div>
                        </div>
                    ) : !isAssignedOrCompleted && (!userInfo || userInfo.role === 'intern' || userInfo.role === 'admin') ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Apply for this Internship</h2>
                            {!userInfo ? (
                                <div className="text-center py-6 space-y-4">
                                    <p className="text-gray-500 font-bold">You need to be logged in as an intern to apply.</p>
                                    <button onClick={() => navigate('/login')} className="btn-primary">Log In to Apply</button>
                                </div>
                            ) : applyMutation.isSuccess ? (
                                <div className="text-center space-y-4 py-6">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle size={32} />
                                    </div>
                                    <p className="text-green-600 font-black text-xl">Application Submitted!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleApply} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">Cover Letter</label>
                                            <textarea required className="input-field h-32" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Why are you the best fit?"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">Resume Submission</label>
                                            <div className="flex gap-4 mb-3">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="uploadType" 
                                                        value="file" 
                                                        checked={uploadType === 'file'} 
                                                        onChange={() => setUploadType('file')} 
                                                        className="accent-indigo-600"
                                                    />
                                                    Upload File (PDF/Image)
                                                </label>
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="uploadType" 
                                                        value="url" 
                                                        checked={uploadType === 'url'} 
                                                        onChange={() => setUploadType('url')} 
                                                        className="accent-indigo-600"
                                                    />
                                                    Provide URL
                                                </label>
                                            </div>
                                            {uploadType === 'file' ? (
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    required 
                                                    onChange={e => setResumeFile(e.target.files[0])} 
                                                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-colors"
                                                />
                                            ) : (
                                                <input 
                                                    type="url" 
                                                    required 
                                                    className="input-field" 
                                                    value={resumeUrl} 
                                                    onChange={e => setResumeUrl(e.target.value)} 
                                                    placeholder="https://your-portfolio.com/resume.pdf" 
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <button type="submit" disabled={applyMutation.isLoading} className="btn-primary w-full md:w-auto px-10">
                                        {applyMutation.isLoading ? 'Sending...' : 'Submit Application'}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Status & Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-6 text-indigo-600 font-black uppercase tracking-widest text-xs">
                            <ShieldCheck size={18} /> Stipend Protected
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700">
                                <span className="text-gray-500 font-bold">Hirer Stipend</span>
                                <span className="text-gray-900 dark:text-white font-black text-xl">₹{gig.budget.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold">Status</span>
                                <span className="text-indigo-600 font-black uppercase text-xs">{gig.status}</span>
                            </div>

                            {/* Conditional Actions */}
                            <div className="pt-6 space-y-3">
                                {isOwner && gig.status === 'assigned' && (
                                    <button onClick={() => statusMutation.mutate('start')} disabled={statusMutation.isLoading} className="btn-primary w-full">Start Work</button>
                                )}
                                {isOwner && gig.status === 'in-progress' && (
                                    <button onClick={() => statusMutation.mutate('complete')} disabled={statusMutation.isLoading} className="btn-primary w-full">Complete Project</button>
                                )}
                                {isHiredIntern && gig.status === 'completed' && (
                                    <button onClick={() => statusMutation.mutate('close')} disabled={statusMutation.isLoading} className="btn-primary w-full">Release Stipend</button>
                                )}

                                {/* Delete button — only for owner on open gigs */}
                                {isOwner && gig.status === 'open' && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full py-3 px-4 border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl font-black hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Trash2 size={16} /> Delete Internship
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Review Card */}
                    {(gig.status === 'completed' || gig.status === 'closed') && userInfo && !hasReviewed && (
                        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20">
                            <h3 className="text-xl font-black mb-4">Leave Feedback</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} type="button" onClick={() => setReviewRating(s)}>
                                            <Star size={24} className={reviewRating >= s ? "fill-white text-white" : "text-indigo-400"} />
                                        </button>
                                    ))}
                                </div>
                                <textarea required className="w-full bg-indigo-500/50 border-none rounded-xl p-3 text-sm placeholder:text-indigo-300 outline-none" value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="How was the experience?"></textarea>
                                <button type="submit" disabled={reviewMutation.isLoading} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors">
                                    {reviewMutation.isLoading ? 'Saving...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
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
                                You are about to permanently delete <span className="font-black text-gray-900 dark:text-white">"{gig.title}"</span>.
                                All associated applications will also be removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => deleteMutation.mutate()}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {deleteMutation.isPending
                                        ? <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                                        : <><Trash2 size={16} /> Delete Forever</>
                                    }
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleteMutation.isPending}
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

export default GigDetail;
