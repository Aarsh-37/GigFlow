import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Search, Zap, Shield, Globe, Users, Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const categories = [
        { name: 'Development', icon: <Zap className="text-yellow-500" />, count: '1.2k+ Openings' },
        { name: 'Design', icon: <Globe className="text-blue-500" />, count: '850+ Openings' },
        { name: 'Marketing', icon: <Users className="text-purple-500" />, count: '640+ Openings' },
        { name: 'Writing', icon: <Shield className="text-green-500" />, count: '420+ Openings' },
    ];

    return (
        <div className="bg-white dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
            {/* 3D-like Decorative Blobs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full animate-blob"></div>
                <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden z-10">
                <div className="container mx-auto px-6 relative">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <span className="inline-block py-1.5 px-4 rounded-full glass text-brand-600 dark:text-brand-400 text-sm font-black tracking-[0.2em] uppercase mb-6 border border-brand-100/50">
                                    The Future of Internship Hiring
                                </span>
                                <h1 className="text-6xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[1.1] mb-8 tracking-tighter">
                                    Connect with <span className="text-brand-600 relative inline-block">
                                        Top
                                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-200 dark:text-brand-900/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" />
                                        </svg>
                                    </span> Interns.
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 lg:pr-20 font-medium leading-relaxed">
                                    GigFlow is the premium marketplace where talent meets opportunity. Find top-tier internships or discover your next career milestone today.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                                    <Link
                                        to={userInfo ? "/dashboard" : "/register"}
                                        className="px-10 py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 transition-all shadow-2xl shadow-brand-500/30 flex items-center justify-center gap-3 group"
                                    >
                                        Get Started <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/gigs"
                                        className="px-10 py-5 glass text-gray-900 dark:text-white rounded-2xl font-black text-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all shadow-sm flex items-center justify-center gap-3"
                                    >
                                        Browse Internships <Search size={22} />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                        
                        <div className="lg:w-1/2 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="relative"
                            >
                                {/* 3D Decorative Cards */}
                                <motion.div 
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-12 -right-12 glass p-6 rounded-3xl shadow-2xl z-20 border border-white/40 hidden md:block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">Secure Payments</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Escrow protected</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    animate={{ y: [0, 15, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -bottom-12 -left-12 glass p-6 rounded-3xl shadow-2xl z-20 border border-white/40 hidden md:block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 overflow-hidden shadow-sm">
                                                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" />
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">10k+ Talent</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vetted professionals</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="relative bg-white dark:bg-dark-card rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] p-4 border border-white/20 overflow-hidden group">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                                        alt="Team working"
                                        className="rounded-[32px] w-full h-auto grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Categories */}
            <section className="py-32 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Browse Top Categories</h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                            Explore specialized talent across various industries and find the perfect match for your project.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((cat, index) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -12, scale: 1.02 }}
                                className="glass p-10 rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 group border border-white/20"
                            >
                                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-600 transition-all duration-500 group-hover:rotate-6">
                                    {React.cloneElement(cat.icon, { size: 32, className: "group-hover:text-white transition-colors" })}
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{cat.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">{cat.count}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Dashboard preview"
                                className="rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700"
                            />
                        </div>
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Why Choose GigFlow?</h2>
                            <div className="space-y-6">
                                {[
                                    { title: 'Top-tier Talent', desc: 'Every intern is vetted to ensure they have the skills to help your business grow.' },
                                    { title: 'Secure Agreement System', desc: 'Clear terms and secure platform ensures a smooth internship experience.' },
                                    { title: 'Real-time Mentorship', desc: 'Built-in chat and notification systems foster direct communication and growth.' },
                                    { title: 'Verified Skillsets', desc: 'Trust-based ecosystem with verified skills and academic backgrounds.' }
                                ].map((feature) => (
                                    <div key={feature.title} className="flex gap-4">
                                        <div className="mt-1 bg-indigo-100 dark:bg-indigo-900/30 p-1 rounded-full h-fit">
                                            <CheckCircle2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                                            <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="bg-indigo-600 rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-8">
                                Ready to bring your <br /> ideas to life?
                            </h2>
                            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                                Join the world's most innovative internship marketplace. Sign up now and find the perfect match in minutes.
                            </p>
                            <Link
                                to="/register"
                                className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all shadow-xl inline-block"
                            >
                                Join GigFlow Today
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
