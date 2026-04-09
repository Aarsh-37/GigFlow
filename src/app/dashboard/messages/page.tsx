import { Search, Send, Paperclip, MoreVertical, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-140px)] -mt-6 pb-6">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 flex h-full overflow-hidden">
        
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-1/3 lg:w-[400px] flex flex-col border-r border-gray-100 bg-[#F8F9FA]">
          <div className="p-8 pb-6 bg-white border-b border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <span className="bg-[#EAEFFF] text-[#1A62FF] text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-widest">3 New</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full pl-11 pr-4 py-3 bg-[#F8FAFD] border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-[#1A62FF] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             {/* Chat Item 1 (Active) */}
             <div className="p-6 border-b border-gray-100 bg-white border-l-4 border-l-[#1A62FF] cursor-pointer hover:bg-gray-50 transition relative overflow-hidden">
               {/* abstract gradient glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
               
               <div className="flex items-center gap-4 relative z-10">
                 <div className="relative">
                   <div className="h-12 w-12 rounded-full bg-[#EAEFFF] flex items-center justify-center text-[#1A62FF] font-bold border-2 border-white shadow-sm">
                     ND
                   </div>
                   <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></div>
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                     <h3 className="text-[15px] font-bold text-gray-900 truncate">Nexus Digital</h3>
                     <span className="text-[9px] font-bold text-[#1A62FF] uppercase tracking-widest">Just now</span>
                   </div>
                   <p className="text-[13px] font-bold text-gray-800 truncate pr-4">Thank you! I'm completely ready to get started...</p>
                 </div>
               </div>
             </div>

             {/* Chat Item 2 */}
             <div className="p-6 border-b border-gray-100 cursor-pointer hover:bg-white transition opacity-80">
               <div className="flex items-center gap-4">
                 <div className="relative">
                   <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold border border-indigo-100">
                     SC
                   </div>
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                     <h3 className="text-[15px] font-bold text-gray-900 truncate">Sarah Chen</h3>
                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">2H AGO</span>
                   </div>
                   <p className="text-[13px] font-medium text-gray-500 truncate">Would you be available for a quick sync on Tuesday?</p>
                 </div>
               </div>
             </div>

             {/* Chat Item 3 */}
             <div className="p-6 border-b border-gray-100 cursor-pointer hover:bg-white transition opacity-80">
               <div className="flex items-center gap-4">
                 <div className="relative">
                   <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold border border-orange-100">
                     AV
                   </div>
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                     <h3 className="text-[15px] font-bold text-gray-900 truncate">Avalon Studios</h3>
                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">YESTERDAY</span>
                   </div>
                   <p className="text-[13px] font-medium text-gray-500 truncate">The final assets have been uploaded to the drive.</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="hidden md:flex flex-col flex-1 bg-white relative">
          
          {/* Chat Header */}
          <div className="h-28 px-10 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-5">
               <div className="h-14 w-14 rounded-full bg-[#EAEFFF] flex items-center justify-center text-[#1A62FF] font-bold border border-blue-100 text-lg">
                 ND
               </div>
               <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                    Nexus Digital <CheckCircle2 className="h-4 w-4 text-blue-500 fill-current opacity-20" />
                  </h2>
                  <p className="text-[9px] font-black text-[#1A62FF] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md uppercase tracking-widest inline-block">
                    Active Gig: UI Design System
                  </p>
               </div>
            </div>
            <button className="h-12 w-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-10 bg-[#FCFDFE] space-y-8">
            <div className="flex justify-center mb-10">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border border-gray-100 px-5 py-2 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                Today, 9:41 AM
              </span>
            </div>
            
            {/* Received Message */}
            <div className="flex items-end gap-4 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-[#EAEFFF] flex items-center justify-center text-[#1A62FF] text-xs font-bold shrink-0 mb-6">N</div>
              <div className="bg-white p-6 rounded-[1.5rem] rounded-bl-sm border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus-within:ring-1 transition">
                <p className="text-[14px] font-medium text-gray-600 leading-relaxed">
                  Hello! We loved your proposal for the UI Design System. The portfolio links you provided completely aligned with the minimalist aesthetic we are aiming for in the FinTech space.
                </p>
                <div className="text-[10px] font-bold text-gray-400 mt-3 pt-3 border-t border-gray-50 uppercase tracking-widest">09:41 AM</div>
              </div>
            </div>

            {/* Sent Message */}
            <div className="flex items-end gap-4 max-w-[80%] ml-auto flex-row-reverse">
              <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0 mb-6 border border-white shadow-sm overflow-hidden flex items-center justify-center">
                 <Image src="https://i.pravatar.cc/150?u=1" alt="Avatar" width={32} height={32} className="object-cover" />
              </div>
              <div className="bg-[#1A62FF] p-6 rounded-[1.5rem] rounded-br-sm shadow-[0_4px_20px_rgba(26,98,255,0.3)]">
                <p className="text-[14px] font-medium text-white leading-relaxed">
                  Thank you! I'm completely ready to get started. Do you have the existing brand guidelines documented anywhere, or will we be establishing those from scratch?
                </p>
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-blue-500/50">
                  <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">09:45 AM</span>
                  <CheckCircle2 className="h-4 w-4 text-white opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-8 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
            <div className="flex items-center gap-3 bg-[#F8FAFD] border border-gray-200/60 rounded-2xl p-2.5 pr-3 focus-within:border-[#1A62FF] focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <button className="h-12 w-12 flex items-center justify-center rounded-[0.8rem] text-gray-400 hover:bg-white hover:shadow-sm transition shrink-0">
                <Paperclip className="h-5 w-5" />
              </button>
              <input 
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-gray-900 placeholder-gray-400 px-2"
              />
              <button className="bg-[#1A62FF] text-white px-8 py-3.5 rounded-[0.8rem] font-bold text-sm shadow-[0_2px_10px_rgba(26,98,255,0.3)] hover:bg-blue-700 transition flex items-center gap-2 shrink-0">
                Send <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
