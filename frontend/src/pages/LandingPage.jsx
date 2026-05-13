import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowRight, Search, Zap, Shield, Globe, Users, Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const categories = [
        { name: 'Development', icon: <Zap className="text-yellow-500" />, count: '1.2k+ Gigs' },
        { name: 'Design', icon: <Globe className="text-blue-500" />, count: '850+ Gigs' },
        { name: 'Marketing', icon: <Users className="text-purple-500" />, count: '640+ Gigs' },
        { name: 'Writing', icon: <Shield className="text-green-500" />, count: '420+ Gigs' },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-widest uppercase mb-4">
                                    The Future of Freelancing
                                </span>
                                <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                                    Connect with <span className="text-indigo-600">Expert</span> Talent Instantly.
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 lg:pr-20">
                                    GigFlow is the premium marketplace where innovation meets expertise. Find top-tier freelancers or discover your next big project today.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link
                                        to={userInfo ? "/dashboard" : "/register"}
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2"
                                    >
                                        Get Started <ArrowRight size={20} />
                                    </Link>
                                    <Link
                                        to="/gigs"
                                        className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        Browse Gigs <Search size={20} />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                        <div className="lg:w-1/2 mt-16 lg:mt-0 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-100 dark:border-gray-700">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Team working"
                                        className="rounded-xl shadow-inner w-full h-auto"
                                    />
                                    <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                            <CheckCircle2 className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Secure Payments</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Escrow protected</p>
                                        </div>
                                    </div>
                                    <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">10k+ Talent</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Vetted professionals</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Categories */}
            <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Browse Top Categories</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Explore specialized talent across various industries and find the perfect match for your project.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((cat, index) => (
                            <motion.div
                                key={cat.name}
                                whileHover={{ y: -10 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group"
                            >
                                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                                    {React.cloneElement(cat.icon, { size: 28, className: "group-hover:text-white transition-colors" })}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cat.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{cat.count}</p>
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
                                    { title: 'Quality over Quantity', desc: 'Every freelancer is vetted to ensure top-tier results for your business.' },
                                    { title: 'Secure Escrow System', desc: 'Your funds are held safely and only released when you are 100% satisfied.' },
                                    { title: 'Real-time Collaboration', desc: 'Built-in chat and notification systems keep your projects on track.' },
                                    { title: 'Transparent Ratings', desc: 'Trust-based ecosystem with verified reviews and portfolio showcases.' }
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
                                Join the world's most innovative freelance marketplace. Sign up now and get your first project started in minutes.
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
