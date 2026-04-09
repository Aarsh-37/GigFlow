'use client';

import { Search, ListFilter, DollarSign, ArrowRight, Bookmark, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAllOpenGigs } from '@/hooks/useGigs';

export default function ExploreGigsPage() {
  const { data: gigs, isLoading, error } = useAllOpenGigs();

  return (
    <div className="pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-10 mb-12">
        <div className="max-w-2xl">
          <span className="text-[#1A62FF] font-bold text-[10px] tracking-widest uppercase mb-6 block">The Adaptive Atelier</span>
          <h1 className="text-5xl md:text-[5.5rem] font-bold tracking-tight text-[#111827] leading-[1.05]">
            Discover your next<br/>
            <span className="text-[#1A62FF]">masterpiece.</span>
          </h1>
        </div>
        <div className="md:w-[35%] flex items-end pb-3 border-l-2 border-gray-200/60 pl-8">
          <p className="text-gray-600 text-[15px] font-medium leading-relaxed">
            Curated opportunities for high-end talent. Filter by craft, budget, or duration to find your perfect professional fit.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col md:flex-row gap-3 mb-10">
        <div className="relative flex-grow flex items-center">
          <Search className="absolute left-5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search gigs, skills, or industries..."
            className="w-full pl-14 pr-4 py-4 text-gray-900 bg-transparent outline-none placeholder-gray-400 font-medium"
          />
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2.5 px-6 py-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition font-bold text-[13px] text-gray-700">
            <ListFilter className="h-4 w-4" /> Category
          </button>
          <button className="flex items-center gap-2.5 px-6 py-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition font-bold text-[13px] text-gray-700">
            <DollarSign className="h-4 w-4 text-gray-400" /> Budget
          </button>
          <button className="bg-[#0f54e6] text-white px-8 py-4 rounded-xl font-bold text-[14px] shadow-sm hover:bg-blue-800 transition whitespace-nowrap">
            Find Gigs
          </button>
        </div>
      </div>

      {/* Load State */}
      {isLoading && (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-10 w-10 text-[#1A62FF] animate-spin opacity-50" />
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500 font-bold bg-red-50 rounded-[2rem]">
          Failed to load opportunities from Supabase. Ensure your database tables and schema run successfully.
        </div>
      )}

      {/* Gigs Grid */}
      {!isLoading && !error && gigs && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* We take the first gig and make it the 'Featured Gig' spanning 2 columns! */}
          {gigs.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition duration-300">
              <div className="p-10 flex-grow flex flex-col justify-between">
                <div>
                  <h2 className="text-[26px] font-bold text-gray-900 leading-snug mb-4 max-w-sm group-hover:text-[#1A62FF] transition-colors">
                    {gigs[0].title}
                  </h2>
                  <p className="text-[15px] font-medium text-gray-500 leading-relaxed max-w-md line-clamp-3">
                    {gigs[0].description}
                  </p>
                </div>
                
                <div className="mt-10 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">Budget Setup</span>
                    <span className="text-3xl font-extrabold text-[#1A62FF] tracking-tight">${gigs[0].budget.toLocaleString()}</span>
                  </div>
                  <Link href={`/dashboard/gig/${gigs[0].id}`} className="flex items-center justify-center gap-3 bg-[#1A62FF] text-white font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-blue-700 transition shadow-[0_4px_14px_rgba(26,98,255,0.3)]">
                    Apply <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="bg-[#111827] md:w-[320px] relative min-h-[300px] flex items-center justify-center p-8 overflow-hidden">
                 {/* Stylistic mockup representing featured content */}
                 <div className="relative z-10 w-44 bg-[#1E232E] aspect-[1/1.6] rounded-sm shadow-2xl flex flex-col items-center justify-center border border-gray-700/50 p-4text-center">
                   <span className="text-white tracking-widest font-serif text-sm opacity-90 mx-auto text-center">{gigs[0].category.toUpperCase()}</span>
                   <div className="w-10 h-px bg-gray-600 my-4 mx-auto"></div>
                   <span className="text-[6px] tracking-widest text-gray-500 uppercase mx-auto text-center">Featured Listing</span>
                 </div>
                 
                 {/* Overlay Badge */}
                 <div className="absolute top-8 right-0 bg-[#FFE4D6] text-orange-900 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-l-md shadow-sm">
                   Expert Level
                 </div>
              </div>
            </div>
          )}

          {/* Render remaining standard gig cards */}
          {gigs.slice(1).map((gig) => (
            <div key={gig.id} className="bg-[#F8FAFD] rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-blue-50/60 flex flex-col hover:border-blue-200 transition group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[#1A62FF] font-black text-[9px] uppercase tracking-widest bg-blue-100/50 px-2.5 py-1 rounded-md">
                  {gig.category}
                </span>
                <Bookmark className="h-5 w-5 text-gray-400 group-hover:text-gray-600 cursor-pointer transition" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-snug mb-3 line-clamp-2">{gig.title}</h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10 flex-grow line-clamp-3">
                {gig.description}
              </p>
              <div className="flex justify-between items-end border-t border-blue-100/50 pt-5">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase block mb-1">Budget</span>
                  <span className="text-lg font-extrabold text-gray-900">${gig.budget.toLocaleString()}</span>
                </div>
                <Link href={`/dashboard/gig/${gig.id}`} className="bg-white text-[#1A62FF] font-bold text-sm px-6 py-2.5 rounded-[0.8rem] border border-blue-100 shadow-sm hover:shadow transition">
                  Apply
                </Link>
              </div>
            </div>
          ))}

          {gigs.length === 0 && (
            <div className="col-span-full text-center bg-gray-50 border border-gray-200 py-24 rounded-[2rem] text-gray-500 font-medium">
              No open opportunities found in the atelier network yet.
            </div>
          )}

        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && !error && gigs && gigs.length > 0 && (
        <div className="mt-16 flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-4 mb-4 sm:mb-0">
            Showing {gigs.length} Gigs
          </span>
          <div className="flex items-center gap-1">
            <button className="h-10 w-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full bg-[#1A62FF] text-white font-bold text-sm shadow-[0_2px_10px_rgba(26,98,255,0.3)]">
              1
            </button>
            <button disabled className="h-10 w-10 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-100 transition opacity-50">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
