import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
=======
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
import api from '../utils/api';
import { ArrowLeft, IndianRupee, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
<<<<<<< HEAD
import Chat from '../components/Chat';
=======
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f

const GigDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    const [gig, setGig] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    // Bid Form State
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');
    const [bidLoading, setBidLoading] = useState(false);
    const [bidError, setBidError] = useState(null);
    const [bidSuccess, setBidSuccess] = useState(false);

<<<<<<< HEAD
    // Review State
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

=======
    // Hire State
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
    // Hire State
    const [hiringId, setHiringId] = useState(null);
    const [confirmHireId, setConfirmHireId] = useState(null);

    const fetchGigDetails = async () => {
        try {
            const { data } = await api.get(`/gigs/${id}`);
            setGig(data);

            // If owner, fetch bids
            if (userInfo && userInfo._id === data.ownerId._id) {
                const bidsRes = await api.get(`/bids/${id}`);
                setBids(bidsRes.data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        fetchGigDetails();
    }, [id, userInfo, navigate]);

    const handlePlaceBid = async (e) => {
        e.preventDefault();
        setBidLoading(true);
        setBidError(null);
        try {
            await api.post('/bids', { gigId: id, message, price: Number(price) });
            setBidSuccess(true);
            setMessage('');
            setPrice('');
        } catch (err) {
            setBidError(err.response?.data?.message || err.message);
        }
        setBidLoading(false);
    };

    const handleHire = async (bidId) => {
<<<<<<< HEAD
=======
        // Optimistic UI update or load state handled by hiringId
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
        try {
            await api.patch(`/bids/${bidId}/hire`);
            toast.success('Freelancer hired successfully!');
            fetchGigDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error hiring freelancer');
        }
        setHiringId(null);
    };

<<<<<<< HEAD
    const handleStatusTransition = async (transition) => {
        try {
            await api.patch(`/gigs/${id}/${transition}`);
            toast.success(`Gig status updated to ${transition}!`);
            fetchGigDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || `Error updating to ${transition}`);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        try {
            const revieweeId = isOwner
                ? bids.find(b => b.status === 'hired')?.freelancerId._id
                : gig.ownerId._id;

            await api.post('/reviews', {
                gigId: id,
                revieweeId,
                rating: reviewRating,
                comment: reviewComment
            });
            toast.success('Review submitted!');
            fetchGigDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error submitting review');
        }
        setReviewLoading(false);
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading project details...</div>;
    if (!gig) return <div className="p-8 text-center text-red-500 font-bold">Project not found</div>;

    const isOwner = userInfo && gig.ownerId && userInfo._id === gig.ownerId._id;
    const isAssigned = gig.status !== 'open';

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
                <ArrowLeft size={18} className="mr-1" /> Back
=======
    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!gig) return <div className="p-8 text-center">Gig not found</div>;

    const isOwner = userInfo && gig.ownerId && userInfo._id === gig.ownerId._id;
    const isAssigned = gig.status === 'assigned';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
            </button>

            {/* Gig Header Card */}
            <div className="card p-8 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border-0 overflow-hidden relative">
                <div className={clsx(
<<<<<<< HEAD
                    "absolute top-0 right-0 px-4 py-2 rounded-bl-xl font-bold uppercase text-[10px] tracking-widest",
                    gig.status === 'open' ? "bg-green-100 text-green-700" :
                        gig.status === 'assigned' ? "bg-primary-100 text-primary-700" :
                            gig.status === 'in-progress' ? "bg-orange-100 text-orange-700" :
                                gig.status === 'completed' ? "bg-indigo-100 text-indigo-700" :
                                    "bg-slate-100 text-slate-600"
                )}>
                    {gig.status.replace('-', ' ')}
                </div>

                <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{gig.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6 font-medium">
                    <div className="flex items-center"><User size={16} className="mr-1 text-slate-400" /> Posted by {gig.ownerId.name}</div>
                    <div className="flex items-center"><Calendar size={16} className="mr-1 text-slate-400" /> {new Date(gig.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center text-slate-700"><IndianRupee size={16} className="mr-1 text-primary-500" /> Budget: ₹{gig.budget.toLocaleString()}</div>
                    {gig.bidDeadline && (
                        <div className="flex items-center text-red-500"><Clock size={16} className="mr-1" /> Deadline: {new Date(gig.bidDeadline).toLocaleDateString()}</div>
                    )}
                </div>

                <div className="prose max-w-none text-slate-600">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Project Brief</h3>
=======
                    "absolute top-0 right-0 px-4 py-2 rounded-bl-xl font-bold uppercase text-xs tracking-wider",
                    gig.status === 'open' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                )}>
                    {gig.status}
                </div>

                <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{gig.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                    <div className="flex items-center"><User size={16} className="mr-1" /> Posted by {gig.ownerId.name}</div>
                    <div className="flex items-center"><Calendar size={16} className="mr-1" /> {new Date(gig.createdAt).toLocaleDateString()}</div>
                    <div className="flex items-center font-semibold text-slate-700"><IndianRupee size={16} className="mr-1 text-primary-500" /> Budget: ₹{gig.budget}</div>
                </div>

                <div className="prose max-w-none text-slate-600">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                    <p className="whitespace-pre-line leading-relaxed">{gig.description}</p>
                </div>
            </div>

<<<<<<< HEAD
            {/* Chat & Lifecycle Section */}
            {userInfo && (isOwner || bids.some(b => b.freelancerId._id === userInfo._id && b.status === 'hired')) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Chat gigId={id} />
                    </div>
                    <div className="space-y-4">
                        <div className="card p-6 bg-white border-0 shadow-lg">
                            <h3 className="font-bold text-slate-900 mb-4 ">Payments & Status</h3>
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4">
                                <span className="text-sm text-slate-500">Escrow Balance</span>
                                <span className="font-bold text-primary-600 text-lg">₹{gig.escrowAmount?.toLocaleString() || 0}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-6">Simulation Status: SECURE</p>

                            <div className="space-y-3">
                                {isOwner && gig.status === 'assigned' && (
                                    <button onClick={() => handleStatusTransition('start')} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                                        <CheckCircle size={18} /> Start Project
                                    </button>
                                )}
                                {isOwner && gig.status === 'in-progress' && (
                                    <button onClick={() => handleStatusTransition('complete')} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                                        <CheckCircle size={18} /> Mark as Completed
                                    </button>
                                )}
                                {!isOwner && gig.status === 'completed' && (
                                    <button onClick={() => handleStatusTransition('close')} className="w-full btn-primary flex items-center justify-center gap-2 py-3 font-bold uppercase text-xs">
                                        <CheckCircle size={18} /> Confirm Completion & Release Payment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Section */}
            {(gig.status === 'completed' || gig.status === 'closed') && (
                <div className="card p-8 bg-white shadow-xl shadow-slate-200/50">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Feedback & Reviews</h2>
                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className={clsx("p-2 rounded-lg transition-colors", reviewRating >= star ? "text-yellow-400" : "text-slate-200")}
                                    >
                                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Comment</label>
                            <textarea
                                required
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="input-field h-24"
                                placeholder="Share your experience working on this project..."
                            />
                        </div>
                        <button type="submit" disabled={reviewLoading} className="btn-primary px-8">
                            {reviewLoading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}

            {/* Owner View: Bids Management */}
            {isOwner && gig.status === 'open' && (
=======
            {/* Owner View: Bids Management */}
            {isOwner && (
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                <div className="space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900">Received Bids ({bids.length})</h2>
                    {bids.length === 0 ? (
                        <div className="card p-8 text-center text-slate-500 italic">No bids yet.</div>
                    ) : (
                        <div className="grid gap-4">
                            {bids.map((bid) => (
                                <div key={bid._id} className={clsx(
                                    "card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300",
                                    bid.status === 'hired' ? "border-green-500 ring-1 ring-green-500 bg-green-50/30" :
                                        bid.status === 'rejected' ? "opacity-60 bg-slate-50" : "hover:border-primary-200"
                                )}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg text-slate-900">₹{bid.price}</span>
                                            {bid.status === 'hired' && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">HIRED</span>}
                                            {bid.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">REJECTED</span>}
                                        </div>
                                        <div className="text-sm font-medium text-slate-700 mb-2">by {bid.freelancerId.name}</div>
                                        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 italic">"{bid.message}"</p>
                                    </div>

<<<<<<< HEAD
                                    {bid.status === 'pending' && (
=======
                                    {!isAssigned && bid.status === 'pending' && (
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                                        <div className="flex items-center gap-2">
                                            {confirmHireId === bid._id ? (
                                                <>
                                                    <span className="text-sm font-medium text-slate-700 mr-2">Are you sure?</span>
                                                    <button
                                                        onClick={() => {
                                                            setHiringId(bid._id);
                                                            handleHire(bid._id);
                                                            setConfirmHireId(null);
                                                        }}
                                                        disabled={hiringId !== null}
                                                        className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        {hiringId === bid._id ? 'Hiring...' : 'Yes, Hire'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmHireId(null)}
                                                        disabled={hiringId !== null}
                                                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmHireId(bid._id)}
                                                    className="btn-primary bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                                >
                                                    Hire Now
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Freelancer View: Place Bid */}
            {!isOwner && userInfo && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-900">Place Your Bid</h2>
                    {bidSuccess ? (
                        <div className="card p-8 bg-green-50 border-green-200 text-center">
                            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                            <h3 className="text-xl font-bold text-green-800 mb-2">Bid Submitted Successfully!</h3>
                            <p className="text-green-700">The client has been notified of your proposal.</p>
                        </div>
                    ) : isAssigned ? (
<<<<<<< HEAD
                        <div className="card p-8 bg-slate-100 text-center text-slate-500 font-medium">
=======
                        <div className="card p-8 bg-slate-100 text-center text-slate-500">
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                            <XCircle size={48} className="mx-auto text-slate-400 mb-4" />
                            <h3 className="text-xl font-bold text-slate-600">This gig is closed</h3>
                            <p>A freelancer has already been hired for this project.</p>
                        </div>
                    ) : (
                        <div className="card p-8 bg-white shadow-lg border-0">
                            {bidError && (
<<<<<<< HEAD
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
=======
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                                    {bidError}
                                </div>
                            )}
                            <form onSubmit={handlePlaceBid} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
<<<<<<< HEAD
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Proposal Message</label>
=======
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Proposal Message</label>
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                                        <textarea
                                            required
                                            className="input-field h-32 resize-none"
                                            placeholder="Why are you the best fit for this job?"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>
                                    <div>
<<<<<<< HEAD
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Your Price (₹)</label>
=======
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Price (₹)</label>
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <IndianRupee size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                required
<<<<<<< HEAD
                                                className="input-field pl-10 font-bold"
=======
                                                className="input-field pl-10"
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                                                placeholder="500"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={bidLoading}
<<<<<<< HEAD
                                        className="btn-primary px-8 py-3"
=======
                                        className="btn-primary px-8"
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
                                    >
                                        {bidLoading ? 'Sending Proposal...' : 'Submit Proposal'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {!userInfo && (
                <div className="card p-8 bg-slate-50 text-center">
                    <p className="text-slate-600 mb-4">Please <Link to="/login" className="text-primary-600 font-bold hover:underline">sign in</Link> to place a bid on this gig.</p>
                </div>
            )}
        </div>
    );
};

export default GigDetail;
