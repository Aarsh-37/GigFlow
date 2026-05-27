import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import api from '../utils/api';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('intern'); // 'hirer' or 'intern'
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            navigate('/');
        }
    }, [navigate, userInfo]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            dispatch(setCredentials(data));
            // Redirect based on role if needed, or just home
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.errors 
                ? err.response.data.errors.map(e => `${e.path}: ${e.message}`).join(', ')
                : err.response?.data?.message || err.message;
            setError(errorMsg);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-display font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-slate-100 dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700">
                    <button 
                        onClick={() => setRole('intern')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${
                            role === 'intern' 
                            ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Apply for Jobs
                    </button>
                    <button 
                        onClick={() => setRole('hirer')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${
                            role === 'hirer' 
                            ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Hire Interns
                    </button>
                </div>

                <div className="card p-8 bg-white dark:bg-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-black/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                    {error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={submitHandler}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex justify-center items-center gap-2 py-2.5"
                        >
                            {loading ? 'Signing in...' : (
                                <>Sign In as {role === 'hirer' ? 'Hirer' : 'Intern'} <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-slate-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/google`}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </a>
                    </div>
                </div>
                <div className="text-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Don't have an account? </span>
                    <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
                        Sign up now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
