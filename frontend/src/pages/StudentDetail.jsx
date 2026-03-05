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
        High: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
        Medium: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
        Low: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    }[level] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-500' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`h-2 w-2 rounded-full ${cfg.dot} ${level === 'High' ? 'animate-pulse' : ''}`} />
            {level} Risk
        </span>
    );
};

/* ── Stat Chip ── */
const StatChip = ({ label, value, color = 'from-violet-600 to-indigo-500' }) => (
    <div className="rounded-2xl border border-white/60 bg-white/50 p-5 backdrop-blur-md shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className={`text-3xl font-black bg-gradient-to-br ${color} bg-clip-text text-transparent`}>{value}</p>
    </div>
);

/* ── Custom Tooltip ── */
const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{payload[0]?.payload?.day}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-0.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs font-black text-slate-800">{entry.name}: {entry.value}</span>
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
    critical: { bg: 'bg-red-50 border-red-200', icon: '🚨', text: 'text-red-700' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: '⚠️', text: 'text-amber-700' },
    positive: { bg: 'bg-emerald-50 border-emerald-200', icon: '✅', text: 'text-emerald-700' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: 'ℹ️', text: 'text-blue-700' },
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
            <div className="flex items-center justify-center h-64">
                <div className="h-10 w-10 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
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
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-violet-600 transition-colors group"
                >
                    <span className="group-hover:-translate-x-1 transition-transform"><ArrowLeftIcon /></span>
                    Back to Student Directory
                </button>

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/40">
                    <div className="flex items-center gap-8">
                        <div
                            className="flex h-24 w-24 items-center justify-center rounded-[2rem] text-4xl font-black text-white shadow-2xl shadow-violet-500/20 transition-transform hover:scale-105 duration-500 flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
                        >
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tight text-slate-800 leading-none">{student.name}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className="px-4 py-1.5 rounded-2xl bg-white/60 border border-white/80 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                                    {student.registerNumber}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="px-4 py-1.5 rounded-2xl bg-white/60 border border-white/80 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                                    {student.department}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="px-4 py-1.5 rounded-2xl bg-white/60 border border-white/80 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm">
                                    {student.email}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Marks</span>
                            <span className={`text-4xl font-black ${student.marks < 50 ? 'text-red-500' : 'text-violet-600'}`}>
                                {student.marks}<span className="text-xl text-slate-400">/100</span>
                            </span>
                        </div>
                        <RiskBadge level={student.riskLevel} />
                        <button
                            onClick={() => setIsMessaging(true)}
                            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(to right, #0ea5e9, #6366f1)' }}
                        >
                            <MessageIcon /> Send Message
                        </button>
                    </div>
                </div>

                {/* ── Stat chips ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatChip label="Attendance" value={`${student.attendance}%`} color="from-emerald-500 to-teal-400" />
                    <StatChip label="Marks" value={`${student.marks}/100`} color="from-violet-600 to-indigo-500" />
                    <StatChip label="Stress Level" value={student.stressLevel} color={student.stressLevel === 'High' ? 'from-red-500 to-rose-400' : student.stressLevel === 'Medium' ? 'from-amber-500 to-orange-400' : 'from-emerald-500 to-teal-400'} />
                    <StatChip label="Risk" value={student.riskLevel} color={student.riskLevel === 'High' ? 'from-red-500 to-rose-400' : student.riskLevel === 'Medium' ? 'from-amber-500 to-orange-400' : 'from-emerald-500 to-teal-400'} />
                </div>

                {/* ── Chart + Logistics side-by-side ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Biometric Trends */}
                    <div className="lg:col-span-2 rounded-[2.5rem] border border-white/50 bg-white/40 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black tracking-tight text-slate-800">Biometric Trends</h3>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-red-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stress</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                                    <YAxis yAxisId="left" hide />
                                    <YAxis yAxisId="right" hide />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Line yAxisId="left" type="monotone" dataKey="performance" name="Performance" stroke="#10b981" strokeWidth={5} dot={{ r: 4, fill: 'white', stroke: '#10b981', strokeWidth: 3 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="stress" name="Stress" stroke="#f87171" strokeWidth={5} dot={{ r: 4, fill: 'white', stroke: '#f87171', strokeWidth: 3 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Logistics & Support */}
                    <div className="rounded-[2.5rem] border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-xl">
                        <h4 className="text-lg font-black tracking-tight text-slate-800 mb-6">Logistics & Support</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { label: 'Tutoring Deployment', color: 'from-violet-600 to-indigo-500' },
                                { label: 'Clinical Counseling', color: 'from-rose-500 to-pink-500' },
                                { label: 'Strategic Study Plan', color: 'from-emerald-500 to-teal-400' },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    className="group relative w-full overflow-hidden rounded-2xl border border-white/60 bg-white/60 px-5 py-4 text-left transition-all hover:border-transparent hover:shadow-lg"
                                    onClick={() => alert(`${action.label} — functionality coming soon!`)}
                                >
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r ${action.color} transition-opacity duration-300`} />
                                    <div className="relative flex items-center justify-between z-10">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{action.label}</span>
                                        <span className="text-slate-400 group-hover:text-white transition-all group-hover:rotate-90"><PlusCircleIcon /></span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Quick stats mini panel */}
                        <div className="mt-6 space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Metrics</p>
                            {[
                                { label: 'Attendance', value: student.attendance, max: 100, color: student.attendance >= 75 ? '#10b981' : '#ef4444' },
                                { label: 'Marks', value: student.marks, max: 100, color: student.marks >= 50 ? '#7c3aed' : '#f97316' },
                            ].map(m => (
                                <div key={m.label}>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                        <span>{m.label}</span><span>{m.value}%</span>
                                    </div>
                                    <div className="h-2 bg-white/50 rounded-full overflow-hidden border border-white/60">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.value}%`, background: m.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── AI Narrative Insights ── */}
                <div className="rounded-[2.5rem] border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                            <SparkleIcon />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-800">{student.name.split(' ')[0]}'s Holistic Analysis</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI-Generated Intelligence Outlook</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {insights.map((ins, i) => {
                            const cfg = insightCfg[ins.type] || insightCfg.info;
                            return (
                                <div key={i} className={`flex items-start gap-4 rounded-2xl border p-5 ${cfg.bg}`}>
                                    <span className="text-2xl mt-0.5">{cfg.icon}</span>
                                    <div>
                                        <p className={`text-sm font-black ${cfg.text} mb-1`}>{ins.title}</p>
                                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{ins.body}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Actionable Guidance Cards ── */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg shadow-violet-400/30" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                            <ZapIcon />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight text-slate-800">Actionable Guidance</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personalised motivational triggers</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        {guidance.map((card, i) => (
                            <div
                                key={i}
                                className={`relative overflow-hidden rounded-[2rem] p-6 shadow-xl ${card.glow} bg-gradient-to-br ${card.gradient} text-white flex flex-col gap-3 transition-transform hover:scale-[1.03] duration-300`}
                            >
                                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                                        {card.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{card.label}</span>
                                </div>
                                <p className="text-base font-black leading-snug">{card.message}</p>
                                <p className="text-xs font-medium text-white/75 leading-relaxed">{card.sub}</p>
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
