import { useEffect, useState, useMemo } from 'react';
import { createStudent, getStudentById, updateStudent } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import FacultyLayout from '../components/FacultyLayout.jsx';

/* ── Live Risk Preview (mirrors backend logic) ── */
const computeRiskPreview = (d) => {
    let score = 0;
    const att = Number(d.attendance) || 0;
    const cgpa = Number(d.cgpa) || 0;
    const bl = Number(d.backlogs) || 0;
    const sleep = Number(d.sleepHours) || 7;
    const disc = Number(d.disciplinaryIssues) || 0;

    // Attendance
    if (att < 50) score += 20; else if (att < 65) score += 15;
    else if (att < 75) score += 10; else if (att < 85) score += 4;
    // CGPA
    if (cgpa < 4) score += 20; else if (cgpa < 5) score += 15;
    else if (cgpa < 6) score += 10; else if (cgpa < 7) score += 4;
    // Backlogs
    if (bl >= 5) score += 20; else if (bl >= 3) score += 14; else if (bl >= 1) score += 7;
    // Class participation
    const cp = d.classParticipation || 'Average';
    if (cp === 'Poor') score += 8; else if (cp === 'Average') score += 4; else if (cp === 'Good') score += 1;
    // Sports
    if (d.sportsParticipation === 'None') score += 4; else if (d.sportsParticipation === 'Occasional') score += 1;
    // Competition
    if (d.competitionParticipation === 'None') score += 4; else if (d.competitionParticipation === 'Occasional') score += 1;
    // Stress
    if (d.stressLevel === 'High') score += 10; else if (d.stressLevel === 'Medium') score += 5;
    // Sleep
    if (sleep < 4 || sleep > 12) score += 8; else if (sleep < 6 || sleep > 10) score += 4;
    else if (sleep < 7 || sleep > 9) score += 1;
    // Disciplinary
    if (disc >= 3) score += 14; else if (disc === 2) score += 8; else if (disc >= 1) score += 4;
    // Faculty remarks
    const rem = (d.facultyRemarks || '').toLowerCase();
    const neg = ['concern', 'absent', 'poor', 'fail', 'struggle', 'disrupt', 'warn', 'lazy', 'irresponsible', 'missing'];
    const pos = ['excellent', 'outstanding', 'improve', 'great', 'diligent', 'committed', 'responsible'];
    score += Math.min(8, neg.filter(k => rem.includes(k)).length * 3);
    score -= Math.min(4, pos.filter(k => rem.includes(k)).length * 2);

    const riskScore = Math.max(0, Math.min(100, Math.round(score)));
    if (riskScore >= 65) return { level: 'High', score: riskScore, color: 'text-rose-600', stroke: '#e11d48', badge: 'bg-rose-50 border-rose-200 text-rose-600' };
    if (riskScore >= 40) return { level: 'Medium', score: riskScore, color: 'text-amber-600', stroke: '#d97706', badge: 'bg-amber-50 border-amber-200 text-amber-600' };
    return { level: 'Low', score: riskScore, color: 'text-emerald-600', stroke: '#059669', badge: 'bg-emerald-50 border-emerald-200 text-emerald-600' };
};

const INITIAL = {
    name: '', registerNumber: '', department: '', email: '', password: '',
    attendance: '', cgpa: '', marks: '', backlogs: '0',
    classParticipation: 'Average',
    sportsParticipation: 'None',
    competitionParticipation: 'None',
    stressLevel: 'Medium',
    sleepHours: '7',
    disciplinaryIssues: '0',
    facultyRemarks: ''
};

const Field = ({ label, hint, children }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
        {hint && <p className="text-[10px] font-medium text-slate-300 mb-2 italic">{hint}</p>}
        {children}
    </div>
);

const inputCls = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all backdrop-blur-md shadow-inner";
const selectCls = `${inputCls} cursor-pointer`;

const TabSelector = ({ options, value, onChange, colors }) => (
    <div className="flex gap-3 flex-wrap">
        {options.map(opt => {
            const active = value === opt.value;
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${active
                        ? (colors?.[opt.value] || 'bg-blue-600 border-blue-400 text-white shadow-lg scale-105')
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                >
                    {opt.label}
                </button>
            );
        })}
    </div>
);

const CreateStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const [formData, setFormData] = useState({ ...INITIAL, department: userInfo?.department || '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (isEdit) fetchStudent(); }, [id]);

    const fetchStudent = async () => {
        setLoading(true);
        try {
            const { data } = await getStudentById(id);
            setFormData({
                name: data.name, registerNumber: data.registerNumber,
                department: data.department, email: data.email, password: '',
                attendance: data.attendance, cgpa: data.cgpa || '', marks: data.marks || '',
                backlogs: data.backlogs ?? 0,
                classParticipation: data.classParticipation || 'Average',
                sportsParticipation: data.sportsParticipation || 'None',
                competitionParticipation: data.competitionParticipation || 'None',
                stressLevel: data.stressLevel || 'Medium',
                sleepHours: data.sleepHours ?? 7,
                disciplinaryIssues: data.disciplinaryIssues ?? 0,
                facultyRemarks: data.facultyRemarks || ''
            });
        } catch { setError('Failed to fetch student details'); }
        finally { setLoading(false); }
    };

    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isEdit) await updateStudent(id, formData);
            else await createStudent(formData);
            navigate('/faculty-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const riskPreview = useMemo(() => computeRiskPreview(formData), [formData]);

    if (loading) return (
        <FacultyLayout>
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Initializing Student Node…</p>
            </div>
        </FacultyLayout>
    );

    return (
        <FacultyLayout>
            <div className="max-w-4xl mx-auto mt-10 space-y-10 pb-20">
                {/* Header */}
                <div className="border-b border-slate-100 pb-8">
                    <h1 className="text-5xl font-bold text-slate-900 tracking-tighter">{isEdit ? 'Refine Student Node' : 'Initialize New Node'}</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 italic">Holistic biometric profiling system</p>
                </div>

                {/* Live Risk Preview Card */}
                <div className={`rounded-[2.5rem] border p-10 flex items-center justify-between gap-8 transition-all duration-700 backdrop-blur-3xl shadow-xl relative overflow-hidden group ${riskPreview.badge}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-4 uppercase">Biometric Risk Projection</p>
                        <p className="text-5xl font-bold tracking-tighter uppercase">{riskPreview.level} RISK</p>
                        <p className="text-[10px] font-bold opacity-40 mt-3 uppercase tracking-widest">Calculated Score: {riskPreview.score} / 100</p>
                    </div>
                    <div className="flex-shrink-0 w-32 h-32 relative group-hover:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl" />
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 relative z-10">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke={riskPreview.stroke} strokeWidth="3"
                                strokeDasharray={`${riskPreview.score} ${100 - riskPreview.score}`}
                                strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold">{riskPreview.score}%</span>
                        </div>
                    </div>
                </div>

                {error && <div className="bg-rose-50 text-rose-600 p-5 rounded-3xl text-[10px] font-bold uppercase tracking-widest border border-rose-200 backdrop-blur-xl shadow-lg">PROTOCOL ERROR: {error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Section 1: Identity ── */}
                    <div className="rounded-[3rem] bg-white/70 border border-slate-200 shadow-xl p-10 space-y-8 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute -left-20 -top-20 h-40 w-40 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600 relative z-10">Student Node Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="md:col-span-2">
                                <Field label="Legal Descriptor (Full Name)">
                                    <input type="text" className={inputCls} value={formData.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. ARUN KUMAR" />
                                </Field>
                            </div>
                            <Field label="Directory Key (Register Number)">
                                <input type="text" className={inputCls} value={formData.registerNumber} onChange={e => set('registerNumber', e.target.value)} required placeholder="e.g. CS2021001" />
                            </Field>
                            <Field label="Assigned Department">
                                <input type="text" className={`${inputCls} bg-slate-100 cursor-not-allowed text-slate-400`} value={formData.department} readOnly />
                            </Field>
                            <Field label="Communication Uplink (Email)">
                                <input type="email" className={inputCls} value={formData.email} onChange={e => set('email', e.target.value)} required placeholder="STDN@UNIV.EDU" />
                            </Field>
                            <Field label={`Access Token (Password)${isEdit ? ' [NULL = RETAIN]' : ''}`}>
                                <input type="password" className={inputCls} value={formData.password} onChange={e => set('password', e.target.value)} required={!isEdit} />
                            </Field>
                        </div>
                    </div>

                    {/* ── Section 2: Academic ── */}
                    <div className="rounded-[3rem] bg-white/70 border border-slate-200 shadow-xl p-10 space-y-8 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 h-40 w-40 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-600 relative z-10">Academic Telemetry</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <Field label="Attendance Index (%)" hint="Cumulative presence frequency">
                                <input type="number" className={inputCls} min="0" max="100" value={formData.attendance} onChange={e => set('attendance', e.target.value)} required placeholder="e.g. 85" />
                            </Field>
                            <Field label="Credit Score (CGPA)" hint="Consolidated grade point average [MAX 10]">
                                <input type="number" className={inputCls} min="0" max="10" step="0.1" value={formData.cgpa} onChange={e => set('cgpa', e.target.value)} required placeholder="e.g. 8.2" />
                            </Field>
                            <Field label="Terminal Backlogs" hint="Active subject failures requiring resolution">
                                <input type="number" className={inputCls} min="0" value={formData.backlogs} onChange={e => set('backlogs', e.target.value)} placeholder="0" />
                            </Field>
                            <Field label="Latest Efficiency (%)" hint="Most recent assessment output">
                                <input type="number" className={inputCls} min="0" max="100" value={formData.marks} onChange={e => set('marks', e.target.value)} placeholder="e.g. 74" />
                            </Field>
                        </div>
                    </div>

                    {/* ── Section 3: Engagement ── */}
                    <div className="rounded-[3rem] bg-white/70 border border-slate-200 shadow-xl p-10 space-y-10 backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute -left-20 -bottom-20 h-40 w-40 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-600 relative z-10">Social & Engagement Data</h3>

                        <div className="grid grid-cols-1 gap-10 relative z-10">
                            <Field label="Class Synchronization Index">
                                <TabSelector
                                    value={formData.classParticipation}
                                    onChange={v => set('classParticipation', v)}
                                    options={[
                                        { value: 'Poor', label: '😶 NULL' },
                                        { value: 'Average', label: '🙂 BASE' },
                                        { value: 'Good', label: '😊 SYNC' },
                                        { value: 'Excellent', label: '🌟 PEAK' },
                                    ]}
                                    colors={{
                                        Poor: 'bg-rose-600 border-rose-400 text-white shadow-lg',
                                        Average: 'bg-amber-600 border-amber-400 text-white shadow-lg',
                                        Good: 'bg-blue-600 border-blue-400 text-white shadow-lg',
                                        Excellent: 'bg-emerald-600 border-emerald-400 text-white shadow-lg',
                                    }}
                                />
                            </Field>

                            <Field label="Athletic Telemetry">
                                <TabSelector
                                    value={formData.sportsParticipation}
                                    onChange={v => set('sportsParticipation', v)}
                                    options={[
                                        { value: 'None', label: '⚪ VOID' },
                                        { value: 'Occasional', label: '🏃 DRIFT' },
                                        { value: 'Regular', label: '🏆 ELITE' },
                                    ]}
                                    colors={{
                                        None: 'bg-slate-50 border-slate-200 text-slate-400 shadow-none',
                                        Occasional: 'bg-amber-600 border-amber-400 text-white shadow-lg',
                                        Regular: 'bg-emerald-600 border-emerald-400 text-white shadow-lg',
                                    }}
                                />
                            </Field>

                            <Field label="Competitive Frequency">
                                <TabSelector
                                    value={formData.competitionParticipation}
                                    onChange={v => set('competitionParticipation', v)}
                                    options={[
                                        { value: 'None', label: '⚪ VOID' },
                                        { value: 'Occasional', label: '🎯 DRIFT' },
                                        { value: 'Regular', label: '🥇 ELITE' },
                                    ]}
                                    colors={{
                                        None: 'bg-slate-50 border-slate-200 text-slate-400 shadow-none',
                                        Occasional: 'bg-amber-600 border-amber-400 text-white shadow-lg',
                                        Regular: 'bg-emerald-600 border-emerald-400 text-white shadow-lg',
                                    }}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* ── Section 4: Wellness ── */}
                    <div className="rounded-[3rem] bg-white/70 border border-slate-200 shadow-xl p-10 space-y-10 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute -right-20 -bottom-20 h-40 w-40 bg-rose-500/5 blur-[60px] rounded-full pointer-events-none" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-600 relative z-10">Vitality & Wellness Telemetry</h3>

                        <div className="space-y-10 relative z-10">
                            <Field label="Centralized Stress Coefficient" hint="Observed metabolic or psychological pressure">
                                <TabSelector
                                    value={formData.stressLevel}
                                    onChange={v => set('stressLevel', v)}
                                    options={[
                                        { value: 'Low', label: '😌 CALM' },
                                        { value: 'Medium', label: '😐 STABLE' },
                                        { value: 'High', label: '😰 CRITICAL' },
                                    ]}
                                    colors={{
                                        Low: 'bg-emerald-600 border-emerald-400 text-white shadow-lg',
                                        Medium: 'bg-amber-600 border-amber-400 text-white shadow-lg',
                                        High: 'bg-rose-600 border-rose-400 text-white shadow-lg',
                                    }}
                                />
                            </Field>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Field label="Circadian Sleep Cycle (Hrs)" hint="24-hour restorative recovery period">
                                    <input type="number" className={inputCls} min="0" max="24" step="0.5" value={formData.sleepHours} onChange={e => set('sleepHours', e.target.value)} placeholder="0.0" />
                                </Field>
                                <Field label="Protocol Deviations" hint="Total count of formal disciplinary events">
                                    <input type="number" className={inputCls} min="0" value={formData.disciplinaryIssues} onChange={e => set('disciplinaryIssues', e.target.value)} placeholder="0" />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 5: Faculty Remarks ── */}
                    <div className="rounded-[3rem] bg-white/70 border border-slate-200 shadow-xl p-10 space-y-6 backdrop-blur-3xl relative overflow-hidden group">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Faculty Observation Log</h3>
                        <p className="text-[10px] text-slate-300 italic font-medium leading-relaxed uppercase tracking-widest">Natural language input influences biometric risk projection via algorithmic keyword analysis.</p>
                        <textarea
                            className={`${inputCls} h-32 resize-none leading-relaxed text-base font-bold`}
                            value={formData.facultyRemarks}
                            onChange={e => set('facultyRemarks', e.target.value)}
                            placeholder="INPUT OBSERVATIONS HERE..."
                        />
                    </div>

                    {/* ── Submit ── */}
                    <button
                        type="submit"
                        className="w-full py-5 rounded-[2rem] text-white font-bold text-[10px] uppercase tracking-[0.4em] shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl border border-white/20 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                    >
                        {isEdit ? 'Authorize Global Node Update' : 'Initialize Student Protocol'}
                    </button>
                </form>
            </div>
        </FacultyLayout>
    );
};

export default CreateStudent;
