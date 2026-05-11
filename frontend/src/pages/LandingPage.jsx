import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, IndianRupee, Clock, ArrowRight, LogIn, UserPlus, Award, Briefcase } from 'lucide-react'; // Icons for CTA and value prop

const LandingPage = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    // Redirect logged-in users to dashboard
    useEffect(() => {
        if (userInfo) {
            navigate('/dashboard');
        }
    }, [userInfo, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col items-center justify-center text-center p-4">
            <header className="mb-12 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-900 mb-4">
                    Find Your Next <span className="text-primary-600">Freelance</span> Opportunity
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Connect with skilled freelancers or discover your next project on GigFlow, the leading marketplace for creative and technical talent. Seamlessly manage projects, payments, and communication all in one place.
                </p>
                <div className="mt-8">
                    <Link to="/register" className="btn-primary btn-lg flex items-center gap-2 justify-center">
                        <UserPlus size={20} /> Get Started
                    </Link>
                </div>
            </header>

            <main className="space-y-12 w-full">
                {/* Value Proposition Section */}
                <section className="py-16">
                    <h2 className="text-4xl font-display font-bold text-slate-900 mb-12 text-center">Why Choose GigFlow?</h2>
                    <div className="grid grid-cols-1 md:grid-grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <div className="flex flex-col items-center p-6 card bg-white shadow-md rounded-xl">
                            <IndianRupee size={40} className="text-primary-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Payments</h3>
                            <p className="text-slate-600">Our escrow system ensures secure transactions for both clients and freelancers.</p>
                        </div>
                        <div className="flex flex-col items-center p-6 card bg-white shadow-md rounded-xl">
                            <Clock size={40} className="text-primary-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Timely Delivery</h3>
                            <p className="text-slate-600">Set clear deadlines and track project progress to ensure timely delivery.</p>
                        </div>
                        <div className="flex flex-col items-center p-6 card bg-white shadow-md rounded-xl">
                            <User size={40} className="text-primary-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Vetted Talent</h3>
                            <p className="text-slate-600">Access a pool of verified and skilled freelancers for your project needs.</p>
                        </div>
                    </div>
                </section>

                {/* How it Works Section - Optional but good for clarity */}
                <section className="py-16 bg-white rounded-xl shadow-lg">
                    <h2 className="text-4xl font-display font-bold text-slate-900 mb-12 text-center">How GigFlow Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto px-4">
                        <div className="text-center">
                            <Search size={40} className="mx-auto text-primary-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Discover</h3>
                            <p className="text-slate-600">Find projects or freelancers that match your needs.</p>
                        </div>
                        <div className="text-center">
                            <IndianRupee size={40} className="mx-auto text-primary-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Bid & Hire</h3>
                            <p className="text-slate-600">Submit proposals or hire the best talent for your project.</p>
                        </div>
                        <div className="text-center">
                            <CheckCircle size={40} className="mx-auto text-primary-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Complete & Pay</h3>
                            <p className="text-slate-600">Deliver your work and get paid securely through our escrow system.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* CTA Section */}
            <section className="bg-primary-600 text-white py-12 px-4 rounded-xl shadow-lg m-8 max-w-3xl mx-auto">
                <h2 className="text-3xl font-display font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-lg mb-8">Join thousands of users finding success on GigFlow today.</p>
                <div className="flex justify-center gap-4">
                    <Link to="/register" className="btn-primary btn-lg bg-white text-primary-600 hover:bg-gray-100">Sign Up Now</Link>
                    <Link to="/login" className="btn-secondary btn-lg">Login</Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
