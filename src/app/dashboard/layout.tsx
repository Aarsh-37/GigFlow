import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <Navbar />
      <main className="max-w-[1400px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <footer className="mt-20 py-12 bg-[#F8F9FA] border-t border-gray-200/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">GigFlow.</span>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
              &copy; 2024 GIGFLOW. THE ADAPTIVE ATELIER.
            </p>
          </div>
          <div className="flex gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-gray-900 transition">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-900 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900 transition">Help Center</Link>
            <Link href="#" className="hover:text-gray-900 transition">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
