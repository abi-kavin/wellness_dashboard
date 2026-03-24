import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById } from '../services/api';
import FacultyLayout from '../components/FacultyLayout.jsx';
import MessageModal from '../components/MessageModal.jsx';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';

/* ── Inline SVG Icons ── */
const ZapIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const StarIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const TrendIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);
const HeartIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const ShieldIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
    </svg>
);
const SparkleIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 2L9.59 9.59 2 12l7.59 2.41L12 22l2.41-7.59L22 12l-7.59-2.41z" />
    </svg>
);
const ArrowLeftIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);
const PlusCircleIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
const MessageIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

/* ── Risk Badge ── */
const RiskBadge = ({ level }) => {
    const cfg = {
        High: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' },
        Medium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' },
        Low: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' },
    }[level] || { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', dot: 'bg-slate-200' };
    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border backdrop-blur-xl ${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`}>
            <span className={`h-2 w-2 rounded-full ${cfg.dot} ${level === 'High' ? 'animate-pulse' : ''}`} />
            {level} RISK LEVEL
        </span>
    );
};

/* ── Stat Chip ── */
const StatChip = ({ label, value, color = 'from-blue-600 to-indigo-600' }) => (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 backdrop-blur-2xl shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className={`text-3xl font-bold bg-gradient-to-br ${color} bg-clip-text text-transparent`}>{value}</p>
    </div>
);

/* ── Custom Tooltip ── */
const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-3xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">{payload[0]?.payload?.day}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs font-bold text-slate-700">{entry.name}: {entry.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ── Generate actionable guidance cards ── */
const getGuidanceCards = (student) => {
    const marks = Number(student.marks) || 0;
    const attendance = Number(student.attendance) || 0;
    const stress = student.stressLevel;
    const risk = student.riskLevel;
    const cards = [];

    // Marks feedback
    if (marks >= 85) {
        cards.push({ icon: <StarIcon />, label: 'Outstanding Marks', message: `${student.name.split(' ')[0]} is performing at the top of their cohort!`, sub: 'Keep up this stellar momentum — department honours are within reach.', gradient: 'from-amber-500 to-yellow-400', glow: 'shadow-amber-400/30' });
    } else if (marks >= 60) {
        cards.push({ icon: <TrendIcon />, label: 'Strong Academic Standing', message: 'Solid marks show consistent dedication and hard work.', sub: 'A small focused push can take you into the distinction bracket!', gradient: 'from-violet-600 to-indigo-500', glow: 'shadow-violet-400/30' });
    } else {
        cards.push({ icon: <ZapIcon />, label: 'Marks Improvement Needed', message: 'Every exam is a fresh chance to turn things around!', sub: 'Schedule a study-group session and target at least one subject for intensive revision.', gradient: 'from-orange-500 to-rose-500', glow: 'shadow-orange-400/30' });
    }

    // Attendance feedback
    if (attendance >= 90) {
        cards.push({ icon: <ShieldIcon />, label: 'Exemplary Attendance', message: `${attendance}% — a habit that directly correlates with higher grades.`, sub: 'Your consistency sets the standard for the entire class. Keep it up!', gradient: 'from-emerald-500 to-teal-400', glow: 'shadow-emerald-400/30' });
    } else if (attendance >= 75) {
        cards.push({ icon: <TrendIcon />, label: 'Good Attendance Rate', message: `${attendance}% — above the minimum threshold and on the right track.`, sub: 'Pushing above 90% could unlock bonus grade points from faculty.', gradient: 'from-cyan-500 to-sky-400', glow: 'shadow-cyan-400/30' });
    } else {
        cards.push({ icon: <ZapIcon />, label: 'Attendance Needs Attention', message: `${attendance}% attendance is below the safe threshold.`, sub: 'Attend at least 3 more sessions per week to avoid academic risk penalties.', gradient: 'from-rose-500 to-pink-500', glow: 'shadow-rose-400/30' });
    }

    // Stress feedback
    if (stress === 'Low') {
        cards.push({ icon: <HeartIcon />, label: 'Excellent Wellness', message: 'Great mental and physical balance detected.', sub: 'A healthy mind fuels a high-performing student. Your wellbeing is your superpower!', gradient: 'from-pink-500 to-fuchsia-500', glow: 'shadow-pink-400/30' });
    } else if (stress === 'Medium') {
        cards.push({ icon: <HeartIcon />, label: 'Wellness on Track', message: 'Moderate stress — managing well overall.', sub: 'Try 10-minute mindfulness sessions daily to maintain and improve balance.', gradient: 'from-purple-500 to-violet-500', glow: 'shadow-purple-400/30' });
    } else {
        cards.push({ icon: <HeartIcon />, label: 'Wellness Needs Support', message: 'High stress levels suggest this student needs help.', sub: 'Consider reaching out to the campus counselling centre — support is their strength!', gradient: 'from-red-500 to-rose-600', glow: 'shadow-red-400/30' });
    }

    // Risk motivational
    const motivational = risk === 'Low'
        ? { icon: <SparkleIcon />, label: 'Keep Shining!', message: 'Low Risk zone — a fantastic place to be!', sub: 'Maintain this trajectory and aim for department honours at the end of term.', gradient: 'from-violet-600 to-indigo-500', glow: 'shadow-violet-400/30' }
        : risk === 'Medium'
            ? { icon: <SparkleIcon />, label: 'You Can Do This!', message: 'Medium risk detected — but every challenge is a growth opportunity.', sub: 'Focus on one improvement area each week and watch the risk level drop fast.', gradient: 'from-amber-500 to-orange-400', glow: 'shadow-amber-400/30' }
            : { icon: <SparkleIcon />, label: 'Believe in the Comeback!', message: 'High risk flagged — but this is just the beginning of the turnaround story.', sub: 'Connect with this student today — the right support changes everything!', gradient: 'from-rose-600 to-pink-500', glow: 'shadow-rose-400/30' };
    cards.push(motivational);

    return cards;
};

/* ── AI System Insights ── */
const getSystemInsights = (student) => {
    const insights = [];
    const marks = Number(student.marks) || 0;
    const att = Number(student.attendance) || 0;

    if (student.riskLevel === 'High') {
        insights.push({ type: 'critical', title: 'Immediate Intervention Required', body: `${student.name} is flagged as high risk. Schedule a welfare meeting within 48 hours.` });
    }
    if (att < 75) {
        insights.push({ type: 'warning', title: 'Low Attendance Alert', body: `Attendance at ${att}% is below the 75% threshold. Risk of academic penalty.` });
    }
    if (marks < 50) {
        insights.push({ type: 'warning', title: 'Academic Performance Concern', body: `Marks at ${marks}% indicate the student may need remedial support or tutoring.` });
    }
    if (student.stressLevel === 'High') {
        insights.push({ type: 'warning', title: 'High Stress Detected', body: 'Student has self-reported high stress. A counselling referral is recommended.' });
    }
    if (student.riskLevel === 'Low' && att >= 85 && marks >= 70) {
        insights.push({ type: 'positive', title: 'Top Performing Student', body: `${student.name} shows excellent metrics across all dimensions. Consider for merit recognition.` });
    }
    if (insights.length === 0) {
        insights.push({ type: 'info', title: 'Monitoring Steady State', body: 'No immediate concerns detected. Continue routine monitoring and periodic check-ins.' });
    }
    return insights;
};

const insightCfg = {
    critical: { bg: 'bg-rose-50 border-rose-200', icon: '🚨', text: 'text-rose-600' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: '⚠️', text: 'text-amber-600' },
    positive: { bg: 'bg-emerald-50 border-emerald-200', icon: '✅', text: 'text-emerald-600' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: 'ℹ️', text: 'text-blue-600' },
};

/* ════════════════════════════════════════════
   Main Component
════════════════════════════════════════════ */
const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMessaging, setIsMessaging] = useState(false);

    useEffect(() => {
        getStudentById(id)
            .then(({ data }) => setStudent(data))
            .catch(() => navigate('/students', { replace: true }))
            .finally(() => setLoading(false));
    }, [id]);

    /* Simulate 7-day biometric trend from real metrics */
    const trend = useMemo(() => {
        if (!student) return [];
        const baseMarks = Number(student.marks) || 50;
        const stressNum = student.stressLevel === 'High' ? 8 : student.stressLevel === 'Medium' ? 5 : 2;
        return Array.from({ length: 7 }).map((_, i) => ({
            day: `Day ${i + 1}`,
            performance: Math.max(0, Math.min(100, Math.round(baseMarks + Math.sin((i / 7) * Math.PI * 2) * 6 + (Math.random() * 6 - 3)))),
            stress: Math.max(1, Math.min(10, Math.round(stressNum + Math.cos((i / 7) * Math.PI * 2) * 1.5 + (Math.random() * 2 - 1)))),
        }));
    }, [student]);

    if (loading) return (
        <FacultyLayout>
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Decrypting Student Profile…</p>
            </div>
        </FacultyLayout>
    );

    if (!student) return null;

    const insights = getSystemInsights(student);
    const guidance = getGuidanceCards(student);

    return (
        <FacultyLayout>
            <div className="space-y-10 pb-12">

                {/* ── Back button ── */}
                <button
                    onClick={() => navigate('/students')}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform"><ArrowLeftIcon /></span>
                    Return to Directory
                </button>

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-100">
                    <div className="flex items-center gap-8">
                        <div
                            className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] text-4xl font-bold text-white shadow-xl transition-transform hover:rotate-6 duration-500 flex-shrink-0 border border-white/30 relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                        >
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                            <span className="relative z-10">{student.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h1 className="text-6xl font-bold tracking-tighter text-slate-900 leading-none">{student.name}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-6">
                                <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm backdrop-blur-2xl">
                                    NODE_{student.registerNumber}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-200" />
                                <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm backdrop-blur-2xl">
                                    {student.department} DEPT
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-200" />
                                <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm backdrop-blur-2xl">
                                    {student.email}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                        <div className="flex items-baseline gap-3 bg-white/70 border border-slate-200 px-6 py-3 rounded-[2rem] backdrop-blur-2xl shadow-xl">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Efficiency Index</span>
                            <span className={`text-4xl font-bold ${student.marks < 50 ? 'text-rose-600' : 'text-blue-600'}`}>
                                {student.marks}<span className="text-xl text-slate-200">/100</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <RiskBadge level={student.riskLevel} />
                            <button
                                onClick={() => setIsMessaging(true)}
                                className="flex items-center gap-2 rounded-2xl px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 border border-white/20 active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                            >
                                <MessageIcon /> Synchronize COMMS
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stat chips ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatChip label="Attendance Telemetry" value={`${student.attendance}%`} color="from-emerald-400 to-teal-400" />
                    <StatChip label="Academic CGPA" value={`${student.cgpa ?? '—'}/10`} color="from-blue-400 to-indigo-500" />
                    <StatChip label="Credit Backlogs" value={student.backlogs ?? 0} color={(student.backlogs ?? 0) > 0 ? 'from-rose-500 to-pink-400' : 'from-emerald-400 to-teal-400'} />
                    <StatChip label="Risk Index" value={`${student.riskScore ?? 0}/100`} color={student.riskLevel === 'High' ? 'from-rose-500 to-pink-400' : student.riskLevel === 'Medium' ? 'from-amber-400 to-orange-400' : 'from-emerald-400 to-teal-400'} />
                    <StatChip label="Stress Variance" value={student.stressLevel} color={student.stressLevel === 'High' ? 'from-rose-500 to-pink-400' : student.stressLevel === 'Medium' ? 'from-amber-400 to-orange-400' : 'from-emerald-400 to-teal-400'} />
                    <StatChip label="Biometric Sleep" value={`${student.sleepHours ?? '—'} hrs`} color="from-blue-400 to-indigo-400" />
                    <StatChip label="Disciplinary Hub" value={student.disciplinaryIssues ?? 0} color={(student.disciplinaryIssues ?? 0) > 0 ? 'from-rose-500 to-pink-400' : 'from-emerald-400 to-teal-400'} />
                    <StatChip label="Wellness Status" value={student.riskLevel} color={student.riskLevel === 'High' ? 'from-rose-500 to-pink-400' : student.riskLevel === 'Medium' ? 'from-amber-400 to-orange-400' : 'from-emerald-400 to-teal-400'} />
                </div>

                {/* ── Engagement Row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[{ label: 'Class Sync Index', value: student.classParticipation }, { label: 'Athletic Telemetry', value: student.sportsParticipation }, { label: 'Competitive Ranking', value: student.competitionParticipation }].map(item => (
                        <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 drop-shadow-sm">{item.label}</p>
                            <p className="text-xl font-black text-white/80 drop-shadow-md">{item.value || '—'}</p>
                        </div>
                    ))}
                </div>

                {/* ── Faculty Remarks ── */}
                {student.facultyRemarks && (
                    <div className="rounded-[2.5rem] border border-blue-100 bg-blue-50/50 p-8 shadow-xl backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute -right-20 -top-20 h-40 w-40 bg-blue-400/5 blur-[50px] rounded-full pointer-events-none" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 mb-4">Observation Log</p>
                        <p className="text-slate-700 text-lg leading-relaxed italic font-medium">"{student.facultyRemarks}"</p>
                    </div>
                )}

                {/* ── Chart + Logistics side-by-side ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Biometric Trends */}
                    <div className="lg:col-span-2 rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-3xl font-bold tracking-tighter text-slate-900">Biometric Trends</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">7-Day Historical Variance</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Efficiency</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.2)]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stress</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[340px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8', letterSpacing: '0.1em' }} />
                                    <YAxis yAxisId="left" hide />
                                    <YAxis yAxisId="right" hide />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }} />
                                    <Line yAxisId="left" type="monotone" dataKey="performance" name="Efficiency" stroke="#2563eb" strokeWidth={6} dot={{ r: 5, fill: '#fff', stroke: '#2563eb', strokeWidth: 3 }} activeDot={{ r: 10, fill: '#2563eb', strokeWidth: 0 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="stress" name="Stress" stroke="#e11d48" strokeWidth={6} dot={{ r: 5, fill: '#fff', stroke: '#e11d48', strokeWidth: 3 }} activeDot={{ r: 10, fill: '#e11d48', strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Logistics & Support */}
                    <div className="rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-3xl relative overflow-hidden flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent pointer-events-none" />
                        <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-8 relative z-10">Channel Protocols</h4>
                        <div className="grid grid-cols-1 gap-4 relative z-10">
                            {[
                                { label: 'Deploy Tutoring', color: 'from-blue-600 to-indigo-600' },
                                { label: 'Clinical Uplink', color: 'from-rose-500 to-pink-600' },
                                { label: 'Strategic Roadmap', color: 'from-emerald-500 to-teal-600' },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-left transition-all hover:scale-105 active:scale-95 shadow-sm"
                                    onClick={() => alert(`${action.label} — connectivity imminent!`)}
                                >
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r ${action.color} transition-opacity duration-300`} />
                                    <div className="relative flex items-center justify-between z-10">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
                                        <span className="text-slate-200 group-hover:text-white transition-all group-hover:rotate-90"><PlusCircleIcon /></span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Quick stats mini panel */}
                        <div className="mt-10 space-y-5 relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Snapshot Telemetry</p>
                            {[
                                { label: 'Attendance', value: student.attendance, max: 100, color: student.attendance >= 75 ? '#3b82f6' : '#e11d48' },
                                { label: 'Efficiency', value: student.marks, max: 100, color: student.marks >= 50 ? '#6366f1' : '#f59e0b' },
                            ].map(m => (
                                <div key={m.label}>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <span>{m.label}</span><span className="text-slate-900">{m.value}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                                        <div className="h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${m.value}%`, background: m.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── AI Narrative Insights ── */}
                <div className="rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg border border-white/30" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                            <SparkleIcon />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tighter text-slate-900">{student.name.split(' ')[0]}'s Core Intelligence</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">Deep-State Holistic Telemetry</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {insights.map((ins, i) => {
                            const cfg = insightCfg[ins.type] || insightCfg.info;
                            return (
                                <div key={i} className={`flex items-start gap-5 rounded-2xl border p-6 ${cfg.bg} backdrop-blur-2xl shadow-sm transition-all hover:scale-[1.01]`}>
                                    <span className="text-3xl mt-0.5">{cfg.icon}</span>
                                    <div>
                                        <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${cfg.text} mb-2`}>{ins.title}</p>
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{ins.body}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Actionable Guidance Cards ── */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg border border-white/30" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                            <ZapIcon />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold tracking-tighter text-slate-900">Actionable Directives</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Personalized student-facing prompts</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        {guidance.map((card, i) => (
                            <div
                                key={i}
                                className={`relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl bg-gradient-to-br ${card.gradient} text-white flex flex-col gap-4 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group border border-white/20`}
                            >
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/10 group-hover:rotate-12 transition-transform">
                                        {card.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{card.label}</span>
                                </div>
                                <p className="text-lg font-black leading-tight relative z-10 drop-shadow-md">{card.message}</p>
                                <p className="text-xs font-bold text-white/70 leading-relaxed relative z-10 drop-shadow-sm font-medium">{card.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Message Modal */}
            {isMessaging && (
                <MessageModal
                    student={student}
                    onClose={() => setIsMessaging(false)}
                />
            )}
        </FacultyLayout>
    );
};

export default StudentDetail;
