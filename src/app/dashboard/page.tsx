import { Navigation, Rocket, CheckCircle2, MessageSquare, FileText, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  return (
    <div className="space-y-12 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h4 className="text-[#1A62FF] font-black text-[10px] tracking-[0.15em] uppercase mb-5">Dashboard Overview</h4>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#111827] leading-[1.1]">
            Welcome back,<br/>
            Alex Rivera.
          </h1>
        </div>
        <div className="flex flex-col items-end gap-5 text-right">
          <p className="text-[#4B5563] text-[15px] font-medium max-w-[320px] leading-relaxed">
            Your professional atelier is optimized. You have 3 active bids requiring attention.
          </p>
          <button className="bg-[#0f54e6] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-[0_4px_14px_rgba(26,98,255,0.3)] hover:bg-blue-800 transition">
            Post a New Gig
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1 */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[180px]">
          <div className="flex justify-between items-start">
            <div className="text-[#1A62FF]"><Briefcase className="h-6 w-6 fill-blue-600/10 stroke-[1.5]" /></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Posted</span>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">12</h2>
            <p className="text-xs text-gray-500 font-medium mt-2">Total Gigs Posted</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#F6F8FD] p-7 rounded-3xl border border-blue-50/50 shadow-sm flex flex-col justify-between h-[180px]">
          <div className="flex justify-between items-start">
            <div className="text-indigo-900/60"><Navigation className="h-6 w-6 fill-indigo-900/10 stroke-[2] rotate-45" /></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Network</span>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">48</h2>
            <p className="text-xs text-gray-500 font-medium mt-2">Applications Sent</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[180px]">
          <div className="flex justify-between items-start">
            <div className="text-amber-700/80"><Rocket className="h-6 w-6 fill-amber-700/10 stroke-[2]" /></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Active</span>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">05</h2>
            <p className="text-xs text-gray-500 font-medium mt-2">Active Projects</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#EAEFFF] p-7 rounded-3xl border border-blue-100/50 shadow-sm flex flex-col justify-between h-[180px]">
          <div className="flex justify-between items-start">
            <div className="text-[#1A62FF]"><div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center"><span className="text-white text-xs font-bold leading-none">$</span></div></div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Revenue</span>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">$14.2k</h2>
            <p className="text-xs text-gray-500 font-medium mt-2">Total Earnings</p>
          </div>
        </div>
      </div>

      {/* Main Grid Floor */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 pt-4">
        
        {/* Left Column: Recent Activity */}
        <div className="space-y-6">
          <div className="flex justify-between items-end pb-2">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <Link href="#" className="text-sm font-bold text-[#1A62FF] hover:text-blue-800">View All History</Link>
          </div>

          <div className="space-y-4">
            {/* Activity Item 1 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-full bg-[#EAEFFF] flex items-center justify-center text-[#1A62FF] flex-shrink-0">
                  <FileText className="h-5 w-5 fill-current opacity-20" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">UI Design System for FinTech App</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">Proposal reviewed by <span className="font-bold text-gray-800">Nexus Digital</span></p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className="px-3 py-1 bg-[#FFF0E5] text-orange-800 text-[9px] font-bold tracking-widest uppercase rounded-full">Under Review</span>
                <span className="text-xs text-gray-400 font-medium">2h ago</span>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-full bg-[#E5F0FF] flex items-center justify-center text-indigo-500 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 fill-current opacity-20" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">E-commerce Backend Migration</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">Application <span className="text-[#1A62FF] font-bold">Accepted</span> by client</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className="px-3 py-1 bg-[#EEF2FF] text-indigo-700 text-[9px] font-bold tracking-widest uppercase rounded-full">New Project</span>
                <span className="text-xs text-gray-400 font-medium">5h ago</span>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-gray-500 flex-shrink-0">
                  <MessageSquare className="h-5 w-5 fill-current opacity-40" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Visual Branding: Organic Skincare</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">New message from <span className="font-bold text-gray-800">Sarah Chen</span></p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[9px] font-bold tracking-widest uppercase rounded-full">Message</span>
                <span className="text-xs text-gray-400 font-medium">Yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Curated Box */}
          <div className="bg-[#F5F8FF] p-8 rounded-[2rem] border border-blue-50/50">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Curated for you</h3>
            
            <div className="space-y-6">
              {/* Box 1 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-[#1A62FF] uppercase">Design</span>
                  <span className="text-xs font-bold text-gray-900">$3,500</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5 leading-snug">Web3 Dashboard Redesign</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Looking for a senior designer to overhaul our DeFi lending protocol interface.</p>
              </div>
              
              <div className="h-px w-full bg-gray-200/50"></div>

              {/* Box 2 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-[#1A62FF] uppercase">Branding</span>
                  <span className="text-xs font-bold text-gray-900">$2,200</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1.5 leading-snug">Identity for AI Startup</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">Clean, minimal brand identity for a silicon valley stealth-mode AI agent.</p>
              </div>

              <button className="w-full bg-[#E5ECFF] text-[#1A62FF] font-bold text-xs py-3.5 rounded-xl hover:bg-blue-100 transition mt-2">
                Discover More
              </button>
            </div>
          </div>

          {/* Elite Box */}
          <div className="bg-[#111827] p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            {/* Background flair */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A62FF] opacity-20 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-3">GigFlow Elite</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6 max-w-[220px]">
                Reach the next level and unlock 0% service fees for 30 days.
              </p>
              
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-3">
                <div className="bg-[#1A62FF] w-[80%] h-full rounded-full"></div>
              </div>
              
              <div className="flex justify-between items-center text-[9px] font-bold tracking-widest uppercase">
                <span className="text-[#1A62FF]">80% Progress</span>
                <span className="text-white">Level 4</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
