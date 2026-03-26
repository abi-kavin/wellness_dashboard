import { useState } from 'react';
import { facultyRegister } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const EyeIcon = ({ open }) => open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const HeartIcon = () => (
    <svg width="22" height="22" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const FacultyRegister = () => {
    const [formData, setFormData] = useState({ name: '', department: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await facultyRegister(formData);
            localStorage.setItem('userInfo', JSON.stringify({ ...response.data, role: 'faculty' }));
            navigate('/faculty-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
        <div className="min-h-screen flex relative overflow-hidden font-['Inter'] items-stretch bg-transparent">
            {/* ── Modern Abstract Shapes Background ── */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] h-[400px] w-[400px] bg-blue-600/10 blur-[120px] rounded-full animate-drift" />
                <div className="absolute bottom-[10%] right-[10%] h-[500px] w-[500px] bg-indigo-600/10 blur-[150px] rounded-full animate-drift [animation-delay:-5s]" />
            </div>

            {/* ── Left Brand Panel ── */}
            <div className="hidden lg:flex lg:w-[45%] relative z-10 overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl border-r border-white/10">
                <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 border border-white/30 text-white">
                        <HeartIcon />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm tracking-wide">Wellness AI</p>
                        <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Risk Analytics</p>
                    </div>
                </div>

                {/* Hero text */}
                <div className="relative z-10 space-y-10">
                    <div>
                        <h1 className="font-bold text-6xl text-white tracking-tighter leading-none mb-4">
                            Faculty<br />
                            <span className="text-white/60">Onboarding.</span>
                        </h1>
                        <p className="text-xl font-bold text-white/90 leading-relaxed max-w-sm">
                            Join the elite network of academic wellness professionals.
                        </p>
                    </div>
                    <div className="space-y-6">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-5 group cursor-default">
                                <div className="text-3xl transition-transform group-hover:scale-125 duration-500">{f.icon}</div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:translate-x-1 transition-transform">{f.title}</h3>
                                    <p className="text-sm font-bold text-white/70">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-white/60 text-xs font-medium">🔒 Institutional-grade security</div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex relative z-10 items-center justify-center p-6 lg:p-14 overflow-y-auto">
                <div className="w-full max-w-sm space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                            Create <br />
                            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Account.</span>
                        </h2>
                        <p className="text-xs font-bold text-slate-400 mt-2">Initialize your administrative node credentials.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl transition-all font-bold text-slate-900 placeholder:text-slate-300"
                            />
                        </div>

                        {/* Dept */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Department</label>
                            <select
                                required
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl transition-all font-bold text-slate-900 appearance-none"
                            >
                                <option value="">Select Domain</option>
                                <option value="CSE">CSE</option><option value="ECE">ECE</option>
                                <option value="IT">IT</option><option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Faculty Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl transition-all font-bold text-slate-900"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl transition-all font-bold text-slate-900"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600">
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                        </div>

                        {error && <div className="text-xs font-bold text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-200">⚠️ {error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 w-full h-12 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                        >
                            {loading ? 'Initializing...' : 'Register Faculty Node'}
                        </button>
                    </form>

                    <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Has account? <Link to="/faculty-login" className="text-blue-600">Authorize Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FacultyRegister;
