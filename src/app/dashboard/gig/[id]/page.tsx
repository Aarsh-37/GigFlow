'use client';

import { useGigDetails, useGigBids, useSubmitBid, useHireFreelancer } from '@/hooks/useBids';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Loader2, DollarSign, CheckCircle, XCircle, FileText, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-10 w-10 text-[#1A62FF] animate-spin opacity-50" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Gig Not Found</h3>
        <p className="text-gray-500 mt-2">This opportunity might have been removed or never existed.</p>
        <Link href="/dashboard/explore" className="text-[#1A62FF] font-bold mt-4 inline-block hover:underline">
          Return to Explore
        </Link>
      </div>
    );
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
    } catch (error) {
      console.error('Failed to hire freelancer', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <Link href="/dashboard/explore" className="inline-flex items-center gap-2 text-[#1A62FF] font-bold text-[10px] tracking-widest uppercase mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Explore
      </Link>
      
      {/* Gig Header */}
      <div className="bg-white rounded-[2rem] p-10 md:p-12 shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <span className="inline-flex items-center rounded-lg bg-[#EAEFFF] px-3.5 py-1.5 text-[10px] font-black text-[#1A62FF] uppercase tracking-widest mb-4">
              {gig.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#111827] leading-[1.1]">
              {gig.title}
            </h1>
          </div>
          <div className="text-left md:text-right flex-shrink-0">
             <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">Fixed Budget</span>
             <span className="text-4xl font-extrabold text-[#1A62FF] tracking-tight">${gig.budget.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 py-6 border-y border-gray-100 my-8">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200">
              {gig.client?.full_name?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Posted by Client</p>
              <p className="font-bold text-gray-900">{gig.client?.full_name}</p>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  gig.status === 'open' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' :
                  gig.status === 'in_progress' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20' :
                  'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20'
                }`}>
                  {gig.status.replace('_', ' ')}
                </div>
            </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-[13px] font-bold text-gray-900 mb-4 uppercase tracking-wider">
            <FileText className="h-4 w-4 text-[#1A62FF]" /> Project Description
          </h3>
          <p className="text-[15px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">
            {gig.description}
          </p>
        </div>
      </div>

      {/* Client View: Show Bids */}
      {isClient && (
        <div className="bg-[#F8F9FA] rounded-[2rem] p-10 md:p-12 border border-gray-200/50">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-gray-900">Proposals Received</h2>
             <span className="bg-gray-200 text-gray-700 font-bold px-3 py-1 rounded-full text-sm">{bids?.length || 0}</span>
          </div>
          
          {bids?.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <p className="text-[15px] font-bold text-gray-400">No proposals yet. Waiting for talent...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bids?.map(bid => (
                <div key={bid.id} className={`bg-white rounded-3xl p-8 transition-all ${
                  bid.status === 'accepted' ? 'border-[#1A62FF] ring-2 ring-[#1A62FF]/20 shadow-[0_4px_20px_rgba(26,98,255,0.1)]' : 
                  bid.status === 'rejected' ? 'border-red-100 opacity-60' :
                  'border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-blue-200 hover:shadow-md'
                }`}>
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="flex gap-5 items-start max-w-xl">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                        {bid.freelancer?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {bid.freelancer?.full_name}
                        </h4>
                        <div className="mt-4 p-5 bg-[#F8FAFD] rounded-2xl border border-blue-50/50 relative">
                           <div className="absolute top-0 transform -translate-y-1/2 left-6 px-2 bg-[#F8FAFD] text-[10px] font-bold tracking-widest text-[#1A62FF] uppercase">Cover Letter</div>
                           <p className="text-[14px] font-medium text-gray-600 leading-relaxed italic">"{bid.message}"</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Proposed Rate</span>
                      <span className="text-3xl font-extrabold text-[#111827]">
                        ${bid.price.toLocaleString()}
                      </span>
                      
                      {bid.status === 'pending' && gig.status === 'open' && (
                        <button
                          onClick={() => onHire(bid.id)}
                          disabled={hireFreelancer.isPending}
                          className="mt-4 px-6 py-3 bg-[#1A62FF] hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(26,98,255,0.3)] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {hireFreelancer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Hire Freelancer
                        </button>
                      )}
                      
                      {bid.status === 'accepted' && (
                        <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EAEFFF] text-[#1A62FF] font-bold text-sm">
                          <CheckCircle className="h-4 w-4" /> Hired
                        </span>
                      )}
                      
                      {bid.status === 'rejected' && (
                        <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-500 font-bold text-sm">
                          <XCircle className="h-4 w-4" /> Declined
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
        <div className="bg-[#111827] rounded-[2rem] p-10 md:p-12 shadow-2xl relative overflow-hidden">
          {/* subtle abstract gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A62FF] opacity-20 blur-[100px] rounded-full translate-x-10 -translate-y-10"></div>
          
          <div className="relative z-10 text-white">
            {hasBid ? (
              <div className={`p-8 rounded-3xl border ${
                userBid.status === 'accepted' ? 'bg-green-900/20 border-green-500/30' :
                userBid.status === 'rejected' ? 'bg-red-900/10 border-red-500/20' :
                'bg-blue-900/20 border-[#1A62FF]/30'
              }`}>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  {userBid.status === 'accepted' && <CheckCircle className="text-green-400 h-6 w-6" />}
                  {userBid.status === 'rejected' && <XCircle className="text-red-400 h-6 w-6" />}
                  {userBid.status === 'pending' && <Loader2 className="text-[#1A62FF] animate-spin h-6 w-6" />}
                  Application Status: <span className="capitalize">{userBid.status}</span>
                </h3>
                <div className="mt-6 flex flex-col md:flex-row gap-6">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 inline-block">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Your Proposed Rate</p>
                    <p className="text-2xl font-extrabold text-white">${userBid.price.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 bg-black/40 p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Your Cover Letter</p>
                    <p className="text-sm font-medium text-gray-300 italic">"{userBid.message}"</p>
                  </div>
                </div>
              </div>
            ) : gig.status !== 'open' ? (
              <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-2">Opportunity Closed</h3>
                <p className="text-gray-400 font-medium text-[15px]">The client has successfully hired a candidate for this role.</p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold mb-8">Submit Your Proposal</h2>
                <form onSubmit={handleSubmit(onBidSubmit)} className="space-y-6 max-w-2xl">
                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-300 mb-3 uppercase tracking-wider">Your Proposed Rate (USD)</label>
                    <div className="relative max-w-[200px]">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-[#1A62FF]" />
                      </div>
                      <input
                        {...register('price', { valueAsNumber: true })}
                        type="number"
                        className="w-full pl-12 pr-5 py-4 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-[#1A62FF] focus:ring-2 focus:ring-[#1A62FF]/50 outline-none transition-all font-bold text-lg"
                        placeholder="e.g. 450"
                      />
                    </div>
                    {errors.price && <p className="mt-2 text-xs font-bold text-red-400">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-300 mb-3 uppercase tracking-wider">Cover Letter</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className="w-full px-5 py-4 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-[#1A62FF] focus:ring-2 focus:ring-[#1A62FF]/50 outline-none transition-all font-medium resize-none"
                      placeholder="Why are you the perfect fit for this atelier opportunity? Link your portfolio..."
                    />
                    {errors.message && <p className="mt-2 text-xs font-bold text-red-400">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitBid.isPending}
                    className="mt-4 px-8 py-4 bg-[#1A62FF] text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(26,98,255,0.4)] hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitBid.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                    Submit Application
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
