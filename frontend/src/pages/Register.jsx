import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import api from '../utils/api';
import { Mail, Lock, User, ArrowRight, Briefcase, Search, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
    {
        id: 'hirer',
        label: 'I want to Hire',
        sublabel: 'Post internships & find interns',
        icon: Briefcase,
        gradient: 'from-brand-500 to-indigo-600',
        glow: 'shadow-indigo-500/30',
        ring: 'ring-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
        id: 'intern',
        label: 'I want to Apply',
        sublabel: 'Find internships & grow your career',
        icon: Search,
        gradient: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-500/30',
        ring: 'ring-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
];

const Register = () => {
    const [step, setStep] = useState(1); // 1 = role picker, 2 = form
    const [selectedRole, setSelectedRole] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) navigate('/dashboard');
    }, [navigate, userInfo]);

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
    };

    const handleRoleContinue = () => {
        if (!selectedRole) {
            setError('Please choose how you want to use GigFlow.');
            return;
        }
        setError(null);
        setStep(2);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/auth/register', {
                name,
                email,
                password,
                role: selectedRole,
            });
            dispatch(setCredentials(data));
            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.errors
                ? err.response.data.errors.map((e) => `${e.path}: ${e.message}`).join(', ')
                : err.response?.data?.message || err.message;
            setError(errorMsg);
        }
        setLoading(false);
    };

    const selectedRoleObj = ROLES.find((r) => r.id === selectedRole);

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-display font-bold text-slate-900 dark:text-white">
                        {step === 1 ? 'Join GigFlow' : 'Create Your Account'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {step === 1
                            ? 'Tell us how you want to use GigFlow'
                            : `Signing up as a ${selectedRoleObj?.label}`}
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-3">
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                s === step
                                    ? 'w-10 bg-brand-600'
                                    : s < step
                                    ? 'w-6 bg-brand-300'
                                    : 'w-6 bg-gray-200 dark:bg-gray-700'
                            }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ── STEP 1: Role Picker ── */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="space-y-4">
                                {ROLES.map((role) => {
                                    const Icon = role.icon;
                                    const isSelected = selectedRole === role.id;
                                    return (
                                        <motion.button
                                            key={role.id}
                                            type="button"
                                            onClick={() => handleRoleSelect(role.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                                                isSelected
                                                    ? `${role.ring} ring-2 border-transparent ${role.bg} shadow-lg ${role.glow}`
                                                    : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <div
                                                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg ${role.glow} flex-shrink-0 transition-all duration-300 ${
                                                    isSelected ? 'scale-110' : ''
                                                }`}
                                            >
                                                <Icon size={24} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white text-base">
                                                    {role.label}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {role.sublabel}
                                                </p>
                                            </div>
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                                                    isSelected
                                                        ? `bg-gradient-to-br ${role.gradient} border-transparent`
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-2 h-2 rounded-full bg-white"
                                                    />
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {error && (
                                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleRoleContinue}
                                className="mt-6 w-full btn-primary flex justify-center items-center gap-2 py-3 text-base font-bold"
                            >
                                Continue <ArrowRight size={18} />
                            </button>

                            <div className="text-center text-sm mt-4">
                                <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
                                <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                                    Sign in
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 2: Registration Form ── */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Selected role pill */}
                            {selectedRoleObj && (
                                <div className="flex items-center gap-3 mb-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline"
                                    >
                                        ← Change role
                                    </button>
                                    <span
                                        className={`ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${selectedRoleObj.gradient} text-white text-xs font-bold shadow-md`}
                                    >
                                        <selectedRoleObj.icon size={12} />
                                        {selectedRoleObj.label}
                                    </span>
                                </div>
                            )}

                            <div className="card p-8 bg-white dark:bg-gray-800 shadow-xl shadow-slate-200/50 dark:shadow-black/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                                {error && (
                                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}
                                <form className="space-y-5" onSubmit={submitHandler}>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="input-field pl-10"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Email Address
                                        </label>
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
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Password
                                        </label>
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
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                className="input-field pl-10"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-primary flex justify-center items-center gap-2 py-2.5"
                                    >
                                        {loading ? (
                                            'Creating Account...'
                                        ) : (
                                            <>
                                                Get Started <ArrowRight size={18} />
                                            </>
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
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </a>
                                </div>
                            </div>
                            <div className="text-center text-sm mt-4">
                                <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
                                <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                                    Sign in
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Register;
