import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import { ArrowLeft, IndianRupee, Calendar, User, CheckCircle, XCircle, Clock, ShieldCheck, MessageSquare, Star } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import Chat from '../components/Chat';
import { addNotification } from '../slices/notificationSlice';
import { motion, AnimatePresence } from 'framer-motion';

// Skeleton component for Gig Detail page
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
    const dispatch = useDispatch();

    const [gig, setGig] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bid Form State
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');
    const [bidLoading, setBidLoading] = useState(false);
    const [bidSuccess, setBidSuccess] = useState(false);

    // Review State
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [hiringId, setHiringId] = useState(null);
    const [confirmHireId, setConfirmHireId] = useState(null);

    const fetchGigDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/gigs/${id}`);
            setGig(data);

            if (userInfo && data.ownerId && userInfo._id === data.ownerId._id) {
                const bidsRes = await api.get(`/bids/${id}`);
                setBids(bidsRes.data);
            }
            
            if (userInfo && data._id) {
                 const reviewsRes = await api.get(`/reviews/gig/${data._id}`);
                 const reviewExists = reviewsRes.data.some(review => review.reviewerId === userInfo._id);
                 setHasReviewed(reviewExists);
            }
        } catch (error) {
            toast.error('Failed to load gig details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGigDetails();
    }, [id, userInfo]);

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            toast.error('Please log in to place a bid.');
            navigate('/login');
            return;
        }
        setBidLoading(true);
        try {
            await api.post('/bids', { gigId: id, message, price: Number(price) });
            setBidSuccess(true);
            toast.success('Proposal sent successfully!');
            fetchGigDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place bid.');
        } finally {
            setBidLoading(false);
        }
    };

    const handleHire = async (bidId) => {
        setHiringId(bidId);
        try {
            await api.patch(`/bids/${bidId}/hire`);
            toast.success('Freelancer hired!');
            fetchGigDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error hiring freelancer');
        } finally {
            setHiringId(null);
        }
    };

    const handleStatusTransition = async (transition) => {
        try {
            await api.patch(`/gigs/${id}/${transition}`);
            toast.success(`Project updated to ${transition.replace('-', ' ')}`);
            fetchGigDetails();
        } catch (err) {
            toast.error('Error updating project status.');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        try {
            const hiredBid = bids.find(b => b.status === 'hired');
            const isOwner = userInfo._id === gig.ownerId._id;
            const revieweeId = isOwner && hiredBid ? hiredBid.freelancerId._id : gig.ownerId._id;

            await api.post('/reviews', {
                gigId: id,
                revieweeId,
                rating: reviewRating,
                comment: reviewComment
            });
            toast.success('Feedback submitted!');
            setHasReviewed(true);
            fetchGigDetails();
        } catch (err) {
            toast.error('Error submitting review');
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return <GigDetailSkeleton />;
    if (!gig) return <div className="text-center py-20 text-red-500 font-bold">Gig not found.</div>;

    const isOwner = userInfo && gig.ownerId && userInfo._id === gig.ownerId._id;
    const hiredBid = bids.find(b => b.status === 'hired');
    const isHiredFreelancer = !isOwner && userInfo && hiredBid && userInfo._id === hiredBid.freelancerId._id;
    const isAssignedOrCompleted = gig.status !== 'open';

    return (
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

                    {/* Chat or Proposals */}
                    {userInfo && (isOwner || isHiredFreelancer) && isAssignedOrCompleted ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <Chat gigId={id} />
                        </div>
                    ) : isOwner ? (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Received Proposals ({bids.length})</h2>
                            <div className="grid gap-4">
                                {bids.map(bid => (
                                    <motion.div 
                                        key={bid._id} 
                                        className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex justify-between items-center"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-black text-gray-900 dark:text-white">₹{bid.price.toLocaleString()}</span>
                                                <span className="text-sm font-bold text-indigo-600">by {bid.freelancerId.name}</span>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm italic">"{bid.message}"</p>
                                        </div>
                                        {bid.status === 'pending' && (
                                            <button 
                                                onClick={() => handleHire(bid._id)}
                                                disabled={hiringId === bid._id}
                                                className="btn-primary"
                                            >
                                                {hiringId === bid._id ? 'Hiring...' : 'Hire Now'}
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                                {bids.length === 0 && <p className="text-center py-10 text-gray-400 font-bold">No proposals received yet.</p>}
                            </div>
                        </div>
                    ) : !isAssignedOrCompleted && userInfo?.role !== 'client' ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Send your proposal</h2>
                            {bidSuccess ? (
                                <div className="text-center space-y-4 py-6">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle size={32} />
                                    </div>
                                    <p className="text-green-600 font-black text-xl">Proposal Submitted!</p>
                                </div>
                            ) : (
                                <form onSubmit={handlePlaceBid} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">Cover Letter</label>
                                            <textarea required className="input-field h-32" value={message} onChange={e => setMessage(e.target.value)} placeholder="Why are you the best fit?"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-2">Your Bid (₹)</label>
                                            <input type="number" required className="input-field" value={price} onChange={e => setPrice(e.target.value)} placeholder="500" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={bidLoading} className="btn-primary w-full md:w-auto px-10">
                                        {bidLoading ? 'Sending...' : 'Submit Proposal'}
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
                            <ShieldCheck size={18} /> Escrow Protected
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-700">
                                <span className="text-gray-500 font-bold">Client Budget</span>
                                <span className="text-gray-900 dark:text-white font-black text-xl">₹{gig.budget.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold">Status</span>
                                <span className="text-indigo-600 font-black uppercase text-xs">{gig.status}</span>
                            </div>

                            {/* Conditional Actions */}
                            <div className="pt-6">
                                {isOwner && gig.status === 'assigned' && (
                                    <button onClick={() => handleStatusTransition('start')} className="btn-primary w-full">Start Work</button>
                                )}
                                {isOwner && gig.status === 'in-progress' && (
                                    <button onClick={() => handleStatusTransition('complete')} className="btn-primary w-full">Complete Project</button>
                                )}
                                {isHiredFreelancer && gig.status === 'completed' && (
                                    <button onClick={() => handleStatusTransition('close')} className="btn-primary w-full">Release Funds</button>
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
                                <button type="submit" disabled={reviewLoading} className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-50 transition-colors">
                                    {reviewLoading ? 'Saving...' : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GigDetail;
