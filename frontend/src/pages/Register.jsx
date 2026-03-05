import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { facultyRegister } from '../services/api';

/* ── Inline Icons ── */
const HeartIcon = () => (
    <svg width="20" height="20" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const EyeIcon = ({ open }) => open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);
const CheckIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const departments = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL', 'BIO', 'AGRI', 'FT', 'BT', 'CSBS'];

function getPasswordStrength(pwd) {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (pwd.length >= 12) s++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[!@#$%^&*]/.test(pwd)) s++;
    return s;
}
const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500', 'bg-emerald-500'];
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong ✓', 'Strong ✓'];

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const strength = getPasswordStrength(formData.password);
    const passwordMatch = formData.password && confirmPassword && formData.password === confirmPassword;

    const update = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (!passwordMatch) { setError('Passwords do not match.'); return; }
        if (!formData.department) { setError('Please select your department.'); return; }

        setLoading(true);
        try {
            const { data } = await facultyRegister(formData);
            localStorage.setItem('userInfo', JSON.stringify({ ...data, role: 'faculty' }));
            setSuccess(true);
            setTimeout(() => navigate('/faculty-dashboard'), 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">

            {/* ── Left Brand Panel ── */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #38bdf8 100%)' }}>
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

                {/* Main copy */}
                <div className="relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2">
                        <span className="text-yellow-300 text-lg">✨</span>
                        <span className="text-white text-xs font-bold tracking-wide">Institutional Registry</span>
                    </div>

                    <h1 className="font-black text-5xl leading-tight text-white">
                        Faculty &<br />
                        <span className="text-yellow-300">Staff Portal.</span>
                    </h1>

                    <p className="text-white/90 text-lg font-medium leading-relaxed max-w-xs">
                        Register as a department faculty member to manage your students and access advanced analytics.
                    </p>

                    {/* Role info cards */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 bg-white/25 border-white/60 shadow-lg">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/30 shrink-0 text-xl">📖</div>
                            <div>
                                <p className="text-white font-black text-sm">Faculty Account</p>
                                <p className="text-white/80 text-xs font-medium mt-0.5">Manage your department's students and analytics</p>
                            </div>
                        </div>
                        <div className="p-4 bg-yellow-400/20 border-2 border-yellow-400/40 rounded-2xl">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-200">⚠️</span>
                                <p className="text-white font-black text-xs uppercase">Student Notice</p>
                            </div>
                            <p className="text-white/80 text-[10px] leading-snug">
                                Students cannot register themselves. Please contact your department faculty to receive your login credentials.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-white/60 text-xs font-medium">🔒 Secured & encrypted registry system</div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto max-h-screen">
                <div className="w-full max-w-md space-y-6 py-8">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                            <HeartIcon />
                        </div>
                        <span className="font-black text-lg text-slate-800">Faculty Registry</span>
                    </div>

                    <div>
                        <h2 className="font-black text-4xl text-slate-800 leading-tight tracking-tight">Create Faculty Account</h2>
                        <p className="text-slate-400 font-medium mt-2 text-sm">
                            Register as an institutional authority for <span className="font-bold text-violet-600">your department</span>
                        </p>
                    </div>

                    {/* Alerts */}
                    {success && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-800 font-bold text-sm">
                            <CheckIcon /> Identity established! Redirecting…
                        </div>
                    )}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 font-bold text-sm">
                            <span className="mt-0.5">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Department */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Academic Department</label>
                            <select
                                required
                                value={formData.department}
                                onChange={update('department')}
                                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all appearance-none"
                            >
                                <option value="">Choose Department</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={update('name')}
                                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 font-semibold placeholder:text-slate-300 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={update('email')}
                                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 font-semibold placeholder:text-slate-300 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Min. 8 characters"
                                    value={formData.password}
                                    onChange={update('password')}
                                    className="w-full h-12 px-4 pr-12 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 font-semibold placeholder:text-slate-300 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            {formData.password && (
                                <div className="px-1 pt-1 space-y-1">
                                    <div className="flex gap-1 h-1.5">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < strength ? strengthColors[strength] : 'bg-slate-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">
                                        Strength: <span className={strength >= 4 ? 'text-emerald-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-500'}>
                                            {strengthLabels[strength]}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className={`w-full h-12 px-4 pr-12 bg-white border-2 rounded-2xl text-slate-800 font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-4 transition-all ${confirmPassword
                                            ? passwordMatch ? 'border-emerald-400 focus:ring-emerald-100' : 'border-red-400 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                                        }`}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <EyeIcon open={showConfirm} />
                                </button>
                            </div>
                            {confirmPassword && !passwordMatch && (
                                <p className="text-xs font-semibold text-red-500 ml-1">Passwords do not match</p>
                            )}
                            {confirmPassword && passwordMatch && (
                                <p className="text-xs font-semibold text-emerald-600 ml-1">✓ Passwords match</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !formData.name.trim() || strength < 2 || !passwordMatch}
                            className="w-full h-14 mt-2 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(to right, #7c3aed, #6366f1)' }}
                        >
                            {loading ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating…
                                </>
                            ) : 'Create Account →'}
                        </button>
                    </form>

                    <p className="text-center text-sm font-medium text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-black text-violet-600 hover:text-violet-800 transition-colors">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
