import Link from 'next/link';
import { ShieldCheck, Lock, Globe2, Zap, ArrowRight, Bell, Star } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-blue-100">
      <nav className="border-b border-gray-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-12">
              <span className="text-xl font-bold tracking-tight text-gray-900">GigFlow</span>
              <div className="hidden md:flex space-x-8 text-sm font-semibold text-gray-500">
                <Link href="/" className="text-blue-600 border-b-2 border-blue-600 pt-1 pb-1">Home</Link>
                <Link href="/dashboard/explore" className="hover:text-gray-900 pt-1 pb-1 transition-colors">Explore Gigs</Link>
                <Link href="/dashboard/my-gigs" className="hover:text-gray-900 pt-1 pb-1 transition-colors">My Gigs</Link>
                <Link href="/dashboard/applications" className="hover:text-gray-900 pt-1 pb-1 transition-colors">Applications</Link>
                <Link href="/dashboard/messages" className="hover:text-gray-900 pt-1 pb-1 transition-colors">Messages</Link>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="text-gray-400 hover:text-gray-600 transition-colors"><Bell className="h-5 w-5" /></button>
              <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                <Image src="https://i.pravatar.cc/150?u=1" alt="Avatar" width={36} height={36} className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center h-[500px]">
          <div className="max-w-2xl">
            <span className="inline-block py-1.5 px-3 rounded-full bg-[#FFE4D6] text-orange-800 text-[10px] font-bold tracking-widest uppercase mb-8">
              The Future of Freelancing
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Find Work.<br/>
              Hire Talent.<br/>
              <span className="text-[#1A62FF]">Build Faster.</span>
            </h1>
            <p className="mt-6 text-base text-gray-500 leading-relaxed max-w-md">
              GigFlow is the adaptive atelier for high-end talent. Join a curated network of professionals building the next generation of digital experiences.
            </p>
            <div className="mt-10 flex gap-4">
              <Link href="/auth/signup" className="px-8 py-3.5 bg-[#1A62FF] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm">
                Post a Gig
              </Link>
              <Link href="/dashboard" className="px-8 py-3.5 bg-[#E8EFFF] text-[#1A62FF] text-sm font-semibold rounded-xl hover:bg-blue-100 transition">
                Find Work
              </Link>
            </div>
          </div>

          <div className="relative h-full w-full hidden lg:block">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl relative h-full w-full border border-gray-100/50">
              <Image 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Professional working" 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 border border-gray-100">
              <div className="h-10 w-10 bg-[#E8EFFF] rounded-full flex items-center justify-center text-[#1A62FF]">
                <Star className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">4.9</p>
                <p className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase mt-0.5">AVG. TALENT RATING</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="mt-32 pt-16 bg-[#F4F5F7] rounded-[3rem] px-8 sm:px-12 py-20 -mx-4 sm:-mx-8">
          <div className="max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Ecosystem of Excellence</h2>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-sm">
              Designed for the world's most ambitious freelancers and companies. We prioritize quality over quantity in everything we do.
            </p>
          </div>

          <div className="mt-16 grid lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
              <div className="h-12 w-12 bg-[#BADCFF] text-[#1A62FF] rounded-2xl flex items-center justify-center mb-8">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Talent</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-10 flex-grow">
                Our multi-stage vetting process ensures you only work with the top 3% of specialized talent across design, engineering, and product.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 font-bold bg-[#FFE4D6] text-orange-900 text-[9px] uppercase tracking-wider rounded-full">Expert</span>
                <span className="px-3 py-1 font-bold bg-[#E8EFFF] text-blue-900 text-[9px] uppercase tracking-wider rounded-full">Vetted</span>
              </div>
            </div>

            <div className="bg-[#1A62FF] p-10 rounded-3xl shadow-sm text-white flex flex-col h-full relative overflow-hidden transform hover:-translate-y-1 transition duration-300">
              <div className="z-10 relative flex flex-col h-full">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-4">Secure Payments</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-12 flex-grow">
                  Smart contracts and milestone-based payments keep your capital and your time protected throughout the project lifecycle.
                </p>
                <div>
                  <p className="text-4xl font-extrabold tracking-tight">100%</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-blue-200 mt-2">Payment Protection</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
              <div className="h-12 w-12 bg-[#BADCFF] text-[#1A62FF] rounded-2xl flex items-center justify-center mb-8">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Global Network</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Tap into a decentralized workforce spanning 120+ countries, operating across every timezone.
              </p>
            </div>

            <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden mt-2">
              <div className="p-10 md:p-14 lg:w-5/12 flex flex-col justify-center">
                <div className="h-12 w-12 bg-[#E8EEFF] text-[#1A62FF] rounded-2xl flex items-center justify-center mb-8">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Matching</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                  Our AI-driven matching engine connects you with the perfect candidate for your specific tech stack and industry in under 48 hours.
                </p>
                <Link href="#" className="font-bold text-[#1A62FF] text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  Learn about FlowMatch <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="lg:w-7/12 bg-black relative min-h-[300px] flex items-center justify-center overflow-hidden p-8">
                <div className="absolute inset-0 bg-[#0a0f1c] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
                
                {/* 3D Dashboard Mockup Representation */}
                <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-[-5deg] scale-105 opacity-90 p-5">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-2 w-24 bg-zinc-700 rounded-full"></div>
                    <div className="h-4 w-12 bg-zinc-800 rounded-full"></div>
                  </div>
                  
                  <div className="flex gap-2 items-end h-32 border-b border-zinc-800/80 pb-3 mt-4">
                    <div className="w-1/6 bg-cyan-700/60 rounded-t h-[40%]"></div>
                    <div className="w-1/6 bg-cyan-700/60 rounded-t h-[70%]"></div>
                    <div className="w-1/6 bg-cyan-700/60 rounded-t h-[30%]"></div>
                    <div className="w-1/6 bg-[#1A62FF] rounded-t h-[90%] shadow-[0_0_15px_rgba(26,98,255,0.4)]"></div>
                    <div className="w-1/6 bg-cyan-700/60 rounded-t h-[60%]"></div>
                    <div className="w-1/6 bg-cyan-700/60 rounded-t h-[50%]"></div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="h-12 border border-zinc-800 rounded-xl bg-zinc-900 max-w-[120px] flex items-center px-4">
                      <div className="w-full">
                        <div className="h-1.5 w-1/3 bg-zinc-700 rounded-full mb-2"></div>
                        <div className="h-2 w-2/3 bg-zinc-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="h-12 border border-blue-900/50 rounded-xl bg-blue-900/10 max-w-[120px] ml-auto flex items-center px-4">
                      <div className="w-full">
                         <div className="h-1.5 w-1/3 bg-blue-500/50 rounded-full mb-2"></div>
                         <div className="h-2 w-2/3 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-32 bg-[#1A62FF] rounded-[2.5rem] p-16 text-center text-white relative flex flex-col items-center">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,#1A62FF,45%,#0F4BD1,55%,#1A62FF)] opacity-80 mix-blend-overlay"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to start your next chapter?</h2>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-10 px-8">
              Join over 50,000+ top-tier freelancers and high-growth companies building the future on GigFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="px-8 py-3.5 bg-white text-[#1A62FF] text-sm font-bold rounded-xl hover:bg-gray-50 transition shadow-sm">
                Create Your Profile
              </Link>
              <Link href="/dashboard" className="px-8 py-3.5 bg-blue-500/20 text-white text-sm font-bold rounded-xl border border-blue-400/20 hover:bg-blue-500/30 transition">
                Browse the Marketplace
              </Link>
            </div>
          </div>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-12 bg-[#F8F9FA]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">GigFlow</span>
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
