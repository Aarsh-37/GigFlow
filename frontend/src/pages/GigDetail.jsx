import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { ArrowLeft, IndianRupee, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

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

    // Hire State
    const [hiringId, setHiringId] = useState(null);

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
        if (!window.confirm('Are you sure you want to hire this freelancer? This will reject all other bids.')) return;

        setHiringId(bidId);
        try {
            await api.patch(`/bids/${bidId}/hire`);
            // Refresh data
            fetchGigDetails();
        } catch (err) {
            alert(err.response?.data?.message || 'Error hiring freelancer');
        }
        setHiringId(null);
    };

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
            </button>

            {/* Gig Header Card */}
            <div className="card p-8 bg-white shadow-xl shadow-slate-200/50 rounded-2xl border-0 overflow-hidden relative">
                <div className={clsx(
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
                    <p className="whitespace-pre-line leading-relaxed">{gig.description}</p>
                </div>
            </div>

            {/* Owner View: Bids Management */}
            {isOwner && (
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

                                    {!isAssigned && bid.status === 'pending' && (
                                        <button
                                            onClick={() => handleHire(bid._id)}
                                            disabled={hiringId !== null}
                                            className="btn-primary bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                        >
                                            {hiringId === bid._id ? 'Hiring...' : 'Hire Now'}
                                        </button>
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
                        <div className="card p-8 bg-slate-100 text-center text-slate-500">
                            <XCircle size={48} className="mx-auto text-slate-400 mb-4" />
                            <h3 className="text-xl font-bold text-slate-600">This gig is closed</h3>
                            <p>A freelancer has already been hired for this project.</p>
                        </div>
                    ) : (
                        <div className="card p-8 bg-white shadow-lg border-0">
                            {bidError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                    {bidError}
                                </div>
                            )}
                            <form onSubmit={handlePlaceBid} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Proposal Message</label>
                                        <textarea
                                            required
                                            className="input-field h-32 resize-none"
                                            placeholder="Why are you the best fit for this job?"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Price (₹)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <IndianRupee size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                className="input-field pl-10"
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
                                        className="btn-primary px-8"
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
