import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { facultyLogin, studentLogin } from '../services/api';

/* ── Inline Icons ── */
const HeartIcon = () => (
    <svg width="22" height="22" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const EyeIcon = ({ open }) => open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const departments = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'BIO', 'AGRI', 'FT', 'BT'];

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('faculty');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: '📈', title: 'Predictive Analytics', desc: 'AI-driven student risk modelling' },
        { icon: '🛡️', title: 'Institutional Shield', desc: 'Data protection & student privacy' },
        { icon: '🎯', title: 'Precision Impact', desc: 'Targeted wellness interventions' },
    ];

    return (
        <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">

            {/* ── Left Brand Panel ── */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #38bdf8 100%)' }}>
                {/* decorative blobs */}
                <div className="absolute top-[-80px] right-[-80px] h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-80px] left-[-60px] h-72 w-72 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 border border-white/30 shadow-lg">
                        <HeartIcon />
                    </div>
                    <div>
                        <p className="text-white font-black text-sm tracking-wide">Wellness AI</p>
                        <p className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">Risk Analytics</p>
                    </div>
                </div>

                {/* Hero text */}
                <div className="relative z-10 space-y-10">
                    <div>
                        <h1 className="font-black text-6xl text-white tracking-tighter leading-none mb-4">
                            Academic<br />
                            <span className="text-white/70">Wellness.</span>
                        </h1>
                        <p className="text-xl font-bold text-white/80 leading-relaxed max-w-sm">
                            Strategic Institutional Wellness & Risk Assessment Dashboard.
                        </p>
                    </div>
                    <div className="space-y-6">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-5 group cursor-default">
                                <div className="text-3xl transition-transform group-hover:scale-125 duration-500">{f.icon}</div>
                                <div>
                                    <h3 className="font-black text-lg text-white group-hover:translate-x-1 transition-transform">{f.title}</h3>
                                    <p className="text-sm font-bold text-white/60">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-white/60 text-xs font-medium">
                    🔒 Secured & encrypted registry system
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-14 overflow-y-auto">
                <div className="w-full max-w-sm space-y-8">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                            <HeartIcon />
                        </div>
                        <span className="font-black text-lg text-slate-800">Wellness AI</span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-800 leading-tight">
                            Authorize <br />
                            <span className="text-violet-600 italic">Access.</span>
                        </h2>
                        <p className="text-xs font-medium text-slate-400 mt-2">Welcome back. Enter your secure registry credentials.</p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                        {[
                            { key: 'faculty', label: '🎓 Faculty' },
                            { key: 'student', label: '📚 Student' },
                        ].map(r => (
                            <button
                                key={r.key}
                                type="button"
                                onClick={() => { setRole(r.key); setError(''); }}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${role === r.key
                                        ? 'bg-white text-violet-600 shadow-md'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                {role === 'faculty' ? 'Faculty Email' : 'Student Email'}
                            </label>
                            <input
                                type="email"
                                required
                                placeholder={role === 'faculty' ? 'Enter your email address' : 'Enter your student email'}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full h-12 px-5 bg-white/70 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all font-semibold text-slate-800 placeholder:text-slate-300 shadow-inner"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Password Token"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full h-12 px-5 pr-12 bg-white/70 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all font-semibold text-slate-800 placeholder:text-slate-300 shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-600 flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-12 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(to right, #7c3aed, #6366f1)' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : (
                                `Sign in as ${role === 'faculty' ? 'Faculty' : 'Student'}`
                            )}
                        </button>
                    </form>

                    {/* Footer links */}
                    <div className="space-y-4">
                        {role === 'faculty' && (
                            <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                New faculty?{' '}
                                <Link to="/faculty-register" className="text-violet-600 hover:text-violet-800 font-black transition-colors">
                                    Register Here
                                </Link>
                            </div>
                        )}
                        {role === 'student' && (
                            <div className="text-center text-xs font-medium text-slate-400 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                                ⚠️ Students cannot self-register. Your faculty will create your login credentials.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
