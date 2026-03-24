import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { facultyLogin, studentLogin } from '../services/api';
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

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('faculty');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (role === 'faculty') {
                const { data } = await facultyLogin({ email, password });
                localStorage.setItem('userInfo', JSON.stringify({ ...data, role: 'faculty' }));
                navigate('/faculty-dashboard');
            } else {
                const { data } = await studentLogin({ email, password });
                localStorage.setItem('userInfo', JSON.stringify({ ...data, role: 'student' }));
                navigate('/student-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Access protocol denied. Terminal credentials required.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 font-['Plus_Jakarta_Sans']">
            {/* ── Background Elements ── */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[480px] p-4 z-10"
            >
                <div className="bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 p-10 sm:p-14 relative overflow-hidden text-center">
                    {/* Header */}
                    <div className="mb-10 flex flex-col items-center text-center">
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={logo} 
                            alt="Logo" 
                            className="h-20 w-auto object-contain mb-8 filter drop-shadow-sm" 
                        />
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                             Please enter your credentials to access the system
                        </p>
                    </div>

                    {/* Role Selector */}
                    <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-10">
                        <button
                            type="button"
                            onClick={() => { setRole('faculty'); setError(''); }}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${role === 'faculty' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                             Faculty Node
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole('student'); setError(''); }}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 ${role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                             Student Node
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                    <UserIcon />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@institution.gov"
                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                                    <LockIcon />
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium text-slate-900"
                                />
                            </div>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm tracking-wider transition-all duration-300 shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-500 text-xs font-medium">
                            Don’t have an account?{' '}
                            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="mt-8 text-center opacity-30 select-none">
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900">Institutional Wellness Platform v5.0</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

