'use client';

import { useGigDetails, useGigBids, useSubmitBid, useHireFreelancer } from '@/hooks/useBids';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Loader2, DollarSign, UserIcon, CheckCircle, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

const bidSchema = z.object({
  price: z.number().min(1, 'Price is required'),
  message: z.string().min(10, 'Cover message must be at least 10 characters'),
});

type BidForm = z.infer<typeof bidSchema>;

export default function GigDetailsPage({ params }: { params: { id: string } }) {
  const gigId = params.id;
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const { data: gig, isLoading: isLoadingGig } = useGigDetails(gigId);
  const { data: bids, isLoading: isLoadingBids } = useGigBids(gigId);
  
  const submitBid = useSubmitBid();
  const hireFreelancer = useHireFreelancer();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BidForm>({
    resolver: zodResolver(bidSchema),
  });

  if (isLoadingGig || isLoadingBids) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!gig) {
    return <div>Gig not found.</div>;
  }

  const isClient = user?.id === gig.client_id;
  const userBid = bids?.find((b) => b.freelancer_id === user?.id);
  const hasBid = !!userBid;

  const onBidSubmit = async (data: BidForm) => {
    try {
      await submitBid.mutateAsync({ gigId, price: data.price, message: data.message });
      reset();
    } catch (error) {
      console.error('Failed to submit bid', error);
    }
  };

  const onHire = async (bidId: string) => {
    if (!user) return;
    try {
      await hireFreelancer.mutateAsync({ gigId, bidId, clientId: user.id });
      // In Phase 6, we will route them to chat here!
    } catch (error) {
      console.error('Failed to hire freelancer', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Gig Header */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-start">
          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/40 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-400">
            {gig.category}
          </span>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              gig.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' :
              gig.status === 'in_progress' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400' :
              'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300'
            }`}>
              {gig.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {gig.title}
        </h1>
        
        <div className="mt-6 border-t border-gray-100 dark:border-zinc-800 pt-6">
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {gig.description}
          </p>
        </div>
        
        <div className="mt-8 flex items-center justify-between bg-gray-50 dark:bg-zinc-950 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-inner">
              {gig.client?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Posted by</p>
              <p className="font-semibold text-gray-900 dark:text-white">{gig.client?.full_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Fixed Budget</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${gig.budget}</p>
          </div>
        </div>
      </div>

      {/* Client View: Show Bids */}
      {isClient && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Freelancer Bids ({bids?.length || 0})</h2>
          
          {bids?.length === 0 ? (
            <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-zinc-800">
              <p className="text-gray-500 dark:text-gray-400">No bids yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bids?.map(bid => (
                <div key={bid.id} className={`bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm transition-all ${
                  bid.status === 'accepted' ? 'border-green-500 ring-1 ring-green-500 shadow-green-50 dark:shadow-none' : 
                  bid.status === 'rejected' ? 'border-red-200 dark:border-red-900/30 opacity-70' :
                  'border-gray-200 dark:border-zinc-800 hover:border-blue-300'
                }`}>
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300">
                        {bid.freelancer?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                          {bid.freelancer?.full_name}
                        </h4>
                        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm italic">"{bid.message}"</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-3 flex-shrink-0">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${bid.price}
                      </span>
                      
                      {bid.status === 'pending' && gig.status === 'open' && (
                        <button
                          onClick={() => onHire(bid.id)}
                          disabled={hireFreelancer.isPending}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {hireFreelancer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Hire Now
                        </button>
                      )}
                      
                      {bid.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 font-bold text-sm">
                          <CheckCircle className="h-4 w-4" /> Hired
                        </span>
                      )}
                      
                      {bid.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 font-bold text-sm">
                          <XCircle className="h-4 w-4" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Freelancer View: Bidding */}
      {!isClient && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
          {hasBid ? (
            <div className={`p-6 rounded-2xl border ${
              userBid.status === 'accepted' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900' :
              userBid.status === 'rejected' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900' :
              'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900'
            }`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {userBid.status === 'accepted' && <CheckCircle className="text-green-600" />}
                {userBid.status === 'rejected' && <XCircle className="text-red-500" />}
                {userBid.status === 'pending' && <Loader2 className="text-blue-500 animate-spin" />}
                Your Bid Status: <span className="capitalize">{userBid.status}</span>
              </h3>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Proposed Price: <span className="font-bold">${userBid.price}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{userBid.message}"</p>
              </div>
            </div>
          ) : gig.status !== 'open' ? (
            <div className="text-center p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">This gig is closed</h3>
              <p className="text-gray-500 dark:text-gray-400">The client has already hired a freelancer for this role.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Submit Your Proposal</h2>
              <form onSubmit={handleSubmit(onBidSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Proposed Price (USD)</label>
                  <div className="relative max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="e.g. 450"
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Cover Message</label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Why are you the best fit for this gig? Mention your experience..."
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitBid.isPending}
                  className="w-full py-3 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center transition-colors disabled:opacity-50"
                >
                  {submitBid.isPending ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
                  Submit Proposal
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
