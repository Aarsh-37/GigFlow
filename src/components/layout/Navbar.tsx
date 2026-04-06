'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import Image from 'next/image';

export function Navbar() {
  const pathname = usePathname() || '';

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight text-gray-900 hover:text-[#1A62FF] transition-colors">GigFlow</Link>
            <div className="relative hidden md:block lg:w-80">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search for opportunities..." 
                 className="w-full pl-10 pr-4 py-3 bg-[#F8F9FA] border border-transparent rounded-[0.8rem] text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1A62FF] focus:ring-4 focus:ring-blue-50 transition-all outline-none"
               />
            </div>
          </div>

          <div className="hidden md:flex space-x-1 font-bold text-[11px] lg:text-[13px] text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/dashboard" className={`${pathname === '/dashboard' ? 'text-[#1A62FF] border-[#1A62FF]' : 'border-transparent hover:text-gray-900'} px-3 lg:px-5 py-[1.8rem] border-b-2 transition-colors`}>Home</Link>
            <Link href="/dashboard/explore" className={`${pathname.includes('explore') ? 'text-[#1A62FF] border-[#1A62FF]' : 'border-transparent hover:text-gray-900'} px-3 lg:px-5 py-[1.8rem] border-b-2 transition-colors`}>Explore Gigs</Link>
            <Link href="/dashboard/my-gigs" className={`${pathname.includes('my-gigs') ? 'text-[#1A62FF] border-[#1A62FF]' : 'border-transparent hover:text-gray-900'} px-3 lg:px-5 py-[1.8rem] border-b-2 transition-colors`}>My Gigs</Link>
            <Link href="/dashboard/applications" className={`${pathname.includes('applications') ? 'text-[#1A62FF] border-[#1A62FF]' : 'border-transparent hover:text-gray-900'} px-3 lg:px-5 py-[1.8rem] border-b-2 transition-colors`}>Applications</Link>
            <Link href="/dashboard/messages" className={`${pathname.includes('messages') ? 'text-[#1A62FF] border-[#1A62FF]' : 'border-transparent hover:text-gray-900'} px-3 lg:px-5 py-[1.8rem] border-b-2 transition-colors`}>Messages</Link>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-gray-600 hover:text-gray-900 transition-colors">
               <Bell className="h-5 w-5" />
               <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-slate-800 border-2 border-white"></span>
            </button>
            <div className="h-9 w-9 rounded-full bg-slate-200 shadow-sm overflow-hidden flex-shrink-0 cursor-pointer border border-gray-100">
              <Image src="https://i.pravatar.cc/150?u=1" alt="Avatar" width={36} height={36} className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
