import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { facultyRegister } from '../services/api';
import logo from '../assets/logo.png';

/* ── Professional Icons ── */
const UserIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="opacity-50">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="opacity-50">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const DeptIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="opacity-50">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Faculty', department: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const update = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password.length < 8) { setError('Access Token Complexity Incomplete. Minimum 8 characters required.'); return; }
        if (formData.password !== confirmPassword) { setError('Access Token Verification Mismatch. Re-input confirmation key.'); return; }

        setLoading(true);
        try {
            const response = await facultyRegister(formData);
            const { data } = response;
            localStorage.setItem('userInfo', JSON.stringify({ ...data, role: 'faculty' }));
            setSuccess(true);
            setTimeout(() => navigate('/faculty-dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registry Protocol Offline. Verify Terminal Data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 font-['Plus_Jakarta_Sans'] py-12 px-6">
            {/* ── Background Elements ── */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[800px] z-10"
            >
                <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 p-10 sm:p-14 relative overflow-hidden text-center">
                    {/* Header */}
                    <div className="mb-12 flex flex-col items-center">
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={logo} 
                            alt="Logo" 
                            className="h-20 w-auto object-contain mb-8 filter drop-shadow-sm" 
                        />
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                             Create New Account
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                             Join the global institutional wellness platform
                        </p>
                    </div>

                    {success ? (
                        <div className="py-12 text-center bg-emerald-50/50 rounded-3xl border border-emerald-100 animate-pulse">
                            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg shadow-emerald-200/50">✓</div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful</h2>
                            <p className="text-slate-500 text-sm font-medium">Redirecting to login portal...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Role */}
                                 <div className={`space-y-2 ${formData.role === 'Faculty' ? 'md:col-span-1' : 'md:col-span-2'}`}>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                            <DeptIcon />
                                        </span>
                                        <select
                                            value={formData.role}
                                            onChange={update('role')}
                                            className="w-full h-14 pl-14 pr-10 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                                        >
                                            <option value="Faculty">Faculty Node (Registrar)</option>
                                            <option value="Student">Student Node (View Only)</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Department - Only for Faculty or shown if role is Faculty */}
                                {formData.role === 'Faculty' && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Department Domain</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                                <DeptIcon />
                                            </span>
                                            <select
                                                required
                                                value={formData.department}
                                                onChange={update('department')}
                                                className="w-full h-14 pl-14 pr-10 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                                            >
                                                <option value="">Select Domain</option>
                                                <option value="CSE">CSE</option>
                                                <option value="ECE">ECE</option>
                                                <option value="IT">IT</option>
                                                <option value="MECH">MECH</option>
                                                <option value="CIVIL">CIVIL</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {formData.role === 'Student' ? (
                                    <div className="md:col-span-2 py-8 px-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 text-center">
                                        <p className="text-sm font-bold text-blue-600 mb-2">Student Registration Protocol</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            Students cannot self-register. Please contact your department faculty <br/>
                                            to initialize your academic node and biometric profile.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                                    <UserIcon />
                                                </span>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={update('name')}
                                                    placeholder="Enter your full name"
                                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold ml-1">@</span>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={update('email')}
                                                    placeholder="name@institution.protocol"
                                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                                    <LockIcon />
                                                </span>
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.password}
                                                    onChange={update('password')}
                                                    placeholder="••••••••••••"
                                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                                    <LockIcon />
                                                </span>
                                                <input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={e => setConfirmPassword(e.target.value)}
                                                    placeholder="Verify password"
                                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-xs font-semibold"
                                    >
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center font-bold">!</span>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                                {formData.role !== 'Student' ? (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm tracking-wider transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                ) : (
                                    <Link 
                                        to="/login"
                                        className="w-full sm:w-auto flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm tracking-wider transition-all duration-300 shadow-xl shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        Go to Login Portal
                                    </Link>
                                )}

                                <div className="text-center sm:text-left">
                                    <p className="text-slate-500 text-xs font-medium">
                                        Already a member?<br />
                                        <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                                            Sign In here
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Branding */}
                <div className="mt-8 text-center opacity-30 select-none">
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900">Institutional Wellness Platform v5.0</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
