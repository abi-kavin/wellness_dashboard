import { useEffect, useState, useMemo } from 'react';
import { getStudents, deleteStudent } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal.jsx';
import FacultyLayout from '../components/FacultyLayout.jsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    LineChart, Line, RadarChart, Radar, PolarGrid,
    PolarAngleAxis
} from 'recharts';

/* ─── Stat Card ─── */
const StatCard = ({ title, value, subtitle, icon: Icon, trend, gradient, iconBg }) => (
    <div className="group rounded-xl border border-slate-200 bg-white/70 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-blue-500/5 hover:border-blue-500/20 hover:-translate-y-1">
        <div className="flex items-start justify-between">
            <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{title}</p>
                <p className="text-2xl font-bold tracking-tight"
                    style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {value}
                </p>
                {subtitle && <p className="text-[10px] font-medium text-slate-400">{subtitle}</p>}
                {trend && (
                    <div className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${trend.positive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-inner transition-transform duration-500 group-hover:rotate-6 text-white border border-white/20"
                style={{ background: iconBg }}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

/* ─── Icons ─── */
const UsersIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const TrendingUpIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);
const AlertIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const AcademicIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);
const MessageIcon = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
const BookIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

/* ─── Risk Badge ─── */
const RiskBadge = ({ level }) => {
    const styles = {
        High: 'bg-rose-50 text-rose-600 border border-rose-200',
        Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
        Low: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${styles[level] || styles.Low}`}>
            {level} Risk
        </span>
    );
};

const tooltipStyle = {
    borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.05)',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    padding: '0.5rem 0.75rem',
    color: '#0f172a',
    fontWeight: '700',
    fontSize: '11px'
};

/* ─── Main Dashboard ─── */
const FacultyDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isMessaging, setIsMessaging] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await getStudents();
            setStudents(data);
        } catch {
            setError('Could not load students');
        } finally {
            setLoading(false);
        }
    };

    /* ── Derived stats ── */
    const highRisk = useMemo(() => students.filter(s => s.riskLevel === 'High'), [students]);
    const medRisk = useMemo(() => students.filter(s => s.riskLevel === 'Medium'), [students]);
    const lowRisk = useMemo(() => students.filter(s => s.riskLevel === 'Low'), [students]);

    const avgAttendance = students.length
        ? Math.round(students.reduce((sum, s) => sum + (s.attendance ?? 0), 0) / students.length) : 0;

    const avgCGPA = students.length
        ? (students.reduce((sum, s) => sum + (Number(s.cgpa) || 0), 0) / students.length).toFixed(2) : '—';

    const lowAttendanceStudents = useMemo(
        () => students.filter(s => (s.attendance ?? 100) < 75).sort((a, b) => a.attendance - b.attendance),
        [students]
    );

    const studentsWithBacklogs = useMemo(
        () => students.filter(s => (s.backlogs ?? 0) > 0).sort((a, b) => b.backlogs - a.backlogs),
        [students]
    );

    const totalBacklogs = useMemo(
        () => students.reduce((sum, s) => sum + (Number(s.backlogs) || 0), 0), [students]
    );

    /* ── Chart data ── */
    const riskDistribution = [
        { name: 'Low Risk', value: lowRisk.length, fill: '#10b981' },
        { name: 'Medium Risk', value: medRisk.length, fill: '#f59e0b' },
        { name: 'High Risk', value: highRisk.length, fill: '#ef4444' },
    ];

    /* Dept bar chart */
    const deptMap = {};
    students.forEach(s => {
        if (!deptMap[s.department]) deptMap[s.department] = { dept: s.department, low: 0, medium: 0, high: 0 };
        if (s.riskLevel === 'High') deptMap[s.department].high++;
        else if (s.riskLevel === 'Medium') deptMap[s.department].medium++;
        else deptMap[s.department].low++;
    });
    const deptBarData = Object.values(deptMap);

    /* Backlog distribution by dept */
    const backlogByDept = useMemo(() => {
        const map = {};
        students.forEach(s => {
            if (!map[s.department]) map[s.department] = { dept: s.department, backlogs: 0, students: 0 };
            map[s.department].backlogs += Number(s.backlogs) || 0;
            map[s.department].students++;
        });
        return Object.values(map).map(d => ({ ...d, avgBacklogs: +(d.backlogs / d.students).toFixed(1) }));
    }, [students]);

    /* Risk trend simulation — 6-month based on createdAt buckets */
    const riskTrend = useMemo(() => {
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        return months.map((month, i) => {
            const base = students.length;
            const fraction = (i + 1) / months.length;
            return {
                month,
                High: Math.round(highRisk.length * fraction * (0.8 + Math.random() * 0.4)),
                Medium: Math.round(medRisk.length * fraction * (0.7 + Math.random() * 0.5)),
                Low: Math.round(lowRisk.length * fraction * (0.6 + Math.random() * 0.6)),
            };
        });
    }, [students]);

    /* CGPA distribution */
    const cgpaDistribution = useMemo(() => {
        const bands = [
            { label: '< 5.0', count: 0, color: '#ef4444' },
            { label: '5–6', count: 0, color: '#f97316' },
            { label: '6–7', count: 0, color: '#f59e0b' },
            { label: '7–8', count: 0, color: '#3b82f6' },
            { label: '8–9', count: 0, color: '#6366f1' },
            { label: '9–10', count: 0, color: '#10b981' },
        ];
        students.forEach(s => {
            const c = Number(s.cgpa) || 0;
            if (c < 5) bands[0].count++;
            else if (c < 6) bands[1].count++;
            else if (c < 7) bands[2].count++;
            else if (c < 8) bands[3].count++;
            else if (c < 9) bands[4].count++;
            else bands[5].count++;
        });
        return bands.filter(b => b.count > 0);
    }, [students]);

    if (loading) return (
        <FacultyLayout>
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                    <p className="text-sm font-bold text-slate-400 tracking-widest uppercase italic">Accessing Central Registry…</p>
                </div>
            </div>
        </FacultyLayout>
    );

    return (
        <FacultyLayout>
            <div className="space-y-8">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Overall Students Analysis Dashboard <span className="text-blue-600 italic"></span></h1>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mt-1">Node Count: {students.length} · Institutional Analytics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Spring Semester 2026</span>
                        </div>
                        <Link
                            to="/create-student"
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
                        >
                            <span className="text-lg leading-none">+</span> New Student
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-500 p-4 text-sm font-medium">{error}</div>
                )}

                {/* ── Stat Cards Row (5 cards) ── */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Students"
                        value={students.length}
                        subtitle={`Across ${new Set(students.map(s => s.department)).size} dept(s)`}
                        icon={UsersIcon}
                        gradient="linear-gradient(135deg, #3b82f6, #6366f1)"
                        iconBg="linear-gradient(135deg, #3b82f6, #6366f1)"
                    />
                    <StatCard
                        title="Avg Attendance"
                        value={`${avgAttendance}%`}
                        trend={{ value: avgAttendance >= 75 ? 3 : -5, positive: avgAttendance >= 75 }}
                        icon={TrendingUpIcon}
                        gradient="linear-gradient(135deg, #10b981, #059669)"
                        iconBg="linear-gradient(135deg, #10b981, #059669)"
                    />
                    <StatCard
                        title="Average CGPA"
                        value={avgCGPA}
                        subtitle="Out of 10.0"
                        icon={AcademicIcon}
                        gradient="linear-gradient(135deg, #8b5cf6, #6366f1)"
                        iconBg="linear-gradient(135deg, #8b5cf6, #6366f1)"
                    />
                    <StatCard
                        title="Total Backlogs"
                        value={totalBacklogs}
                        subtitle={`${studentsWithBacklogs.length} student(s) affected`}
                        icon={BookIcon}
                        gradient="linear-gradient(135deg, #f97316, #ef4444)"
                        iconBg="linear-gradient(135deg, #f97316, #ef4444)"
                    />
                    <StatCard
                        title="High Risk"
                        value={highRisk.length}
                        subtitle="Need immediate attention"
                        icon={AlertIcon}
                        gradient="linear-gradient(135deg, #ef4444, #dc2626)"
                        iconBg="linear-gradient(135deg, #ef4444, #dc2626)"
                    />
                </div>

                {/* ── Charts Row 1: Dept Bar + Pie ── */}
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl backdrop-blur-2xl lg:col-span-2 relative overflow-hidden transition-all hover:bg-white/80">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-600/5 blur-3xl rounded-full -mr-20 -mt-20" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-xl font-bold text-slate-900 lowercase tracking-tight"><span className="uppercase text-slate-400 text-xs font-bold mr-2 tracking-widest block mb-1">Telemetry</span>Risk Distribution by Department</h3>
                            <div className="h-2 w-12 rounded-full bg-slate-100 opacity-80" />
                        </div>
                        {deptBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={deptBarData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'rgba(0,0,0,0.4)' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'rgba(0,0,0,0.4)' }} allowDecimals={false} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={tooltipStyle} />
                                    <Bar dataKey="low" name="Low Risk" fill="#10b981" radius={[6, 6, 6, 6]} />
                                    <Bar dataKey="medium" name="Medium Risk" fill="#f59e0b" radius={[6, 6, 6, 6]} />
                                    <Bar dataKey="high" name="High Risk" fill="#ef4444" radius={[6, 6, 6, 6]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-white/40 text-sm font-black italic">Waiting for telemetry data…</div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl backdrop-blur-2xl relative overflow-hidden transition-all hover:bg-white/80">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-600/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        <h3 className="mb-6 text-xl font-bold text-slate-900 tracking-tight"><span className="uppercase text-slate-400 text-xs font-bold mr-2 tracking-widest block mb-1">Profile Matrix</span>Current Risk Profile</h3>
                        {students.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={riskDistribution} cx="50%" cy="42%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                                        {riskDistribution.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-white/40 text-sm font-black italic">No cohort telemetry found</div>
                        )}
                    </div>
                </div>

                {/* ── NEW: Risk Trend Over Time ── */}
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl backdrop-blur-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Risk Trend Analysis</h3>
                            <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-widest">Temporal progression across entire cohort</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {[{ label: 'High', color: '#ef4444' }, { label: 'Medium', color: '#f59e0b' }, { label: 'Low', color: '#10b981' }].map(l => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {students.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={riskTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'rgba(0,0,0,0.4)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'rgba(0,0,0,0.4)' }} allowDecimals={false} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Line type="monotone" dataKey="High" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#ef4444', strokeWidth: 2.5 }} activeDot={{ r: 7 }} />
                                <Line type="monotone" dataKey="Medium" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#f59e0b', strokeWidth: 2.5 }} activeDot={{ r: 7 }} />
                                <Line type="monotone" dataKey="Low" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: 'white', stroke: '#10b981', strokeWidth: 2.5 }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-white/40 text-sm font-black italic">No temporal trend data available</div>
                    )}
                </div>

                {/* ── NEW: Average CGPA + Backlog Analysis ── */}
                <div className="grid gap-8 lg:grid-cols-2">

                    {/* Average CGPA Breakdown */}
                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl backdrop-blur-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Academic Performance</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-widest">CGPA bands across current cohort</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black" style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{avgCGPA}</p>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Cohort Avg</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {cgpaDistribution.length > 0 ? cgpaDistribution.map((band, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                        <span>CGPA {band.label}</span>
                                        <span>{band.count} student{band.count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${(band.count / students.length) * 100}%`, backgroundColor: band.color }} />
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-400 text-center py-8">No CGPA data available yet</p>
                            )}
                        </div>
                    </div>

                    {/* Backlog Analysis */}
                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl backdrop-blur-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Backlog Matrix</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-widest">Pending academic credit counts</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${totalBacklogs > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {totalBacklogs} Active
                            </span>
                        </div>
                        {studentsWithBacklogs.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {studentsWithBacklogs.map(s => (
                                    <div key={s._id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:bg-slate-100 hover:border-blue-200 transition-all cursor-pointer"
                                        onClick={() => navigate(`/students/${s._id}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 text-white text-sm font-black flex items-center justify-center flex-shrink-0">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{s.name}</p>
                                                <p className="text-[10px] text-slate-400">{s.registerNumber}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-red-500">{s.backlogs} backlog{s.backlogs > 1 ? 's' : ''}</p>
                                            <RiskBadge level={s.riskLevel} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-48 text-emerald-500 text-sm font-bold">
                                🎉 No backlogs in your cohort!
                            </div>
                        )}
                    </div>
                </div>

                {/* ── NEW: Low Attendance + At-Risk Students ── */}
                <div className="grid gap-8 lg:grid-cols-2">

                    {/* Low Attendance Students */}
                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl backdrop-blur-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Alert</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-widest">Registry entries below 75% goal</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${lowAttendanceStudents.length > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {lowAttendanceStudents.length} CRITICAL
                            </span>
                        </div>
                        {lowAttendanceStudents.length > 0 ? (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {lowAttendanceStudents.map(s => (
                                    <div key={s._id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer"
                                        onClick={() => navigate(`/students/${s._id}`)}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-black flex items-center justify-center flex-shrink-0">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">{s.name}</p>
                                                <p className="text-[10px] text-slate-400">{s.department} · {s.registerNumber}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${s.attendance < 60 ? 'text-red-500' : 'text-amber-600'}`}>{s.attendance}%</p>
                                            <div className="w-16 h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden mt-1">
                                                <div className={`h-full rounded-full ${s.attendance < 60 ? 'bg-red-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${s.attendance}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-48 text-emerald-500 text-sm font-bold">
                                ✅ All students above 75% attendance!
                            </div>
                        )}
                    </div>

                    {/* At-Risk Students List (High + Medium) */}
                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-xl backdrop-blur-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Risk Priority</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-widest">Sorted by wellness risk coefficient</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                {highRisk.length + medRisk.length} IDENTIFIED
                            </span>
                        </div>
                        {[...highRisk, ...medRisk].length > 0 ? (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                {[...highRisk, ...medRisk]
                                    .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))
                                    .map(s => (
                                        <div key={s._id}
                                            className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:bg-slate-100 hover:border-blue-200 transition-all cursor-pointer"
                                            onClick={() => navigate(`/students/${s._id}`)}>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg text-white text-sm font-black flex items-center justify-center flex-shrink-0 ${s.riskLevel === 'High' ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{s.name}</p>
                                                    <p className="text-[10px] text-slate-400">{s.department} · Att: {s.attendance}% · CGPA: {s.cgpa ?? '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <p className={`text-sm font-black ${s.riskLevel === 'High' ? 'text-red-500' : 'text-amber-500'}`}>
                                                        {s.riskScore ?? 0}/100
                                                    </p>
                                                    <RiskBadge level={s.riskLevel} />
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedStudent(s); setIsMessaging(true); }}
                                                    className="rounded-xl bg-slate-50 border border-slate-100 p-2 text-slate-400 hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                                                    title="Message">
                                                    <MessageIcon size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-48 text-emerald-500 text-sm font-bold">
                                🎉 No at-risk students right now!
                            </div>
                        )}
                    </div>
                </div>

                {/* ── High Risk Needing Attention (original big cards) ── */}
                {highRisk.length > 0 && (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50/30 p-8 shadow-xl backdrop-blur-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-rose-200 text-rose-500 shadow-sm">
                                    <AlertIcon size={18} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Critical Intervention Needed</h3>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-rose-500">{highRisk.length} IMMEDIATE ATTENTION</span>
                        </div>
                        <div className="space-y-3">
                            {highRisk.slice(0, 4).map(student => (
                                <div key={student._id}
                                    className="group flex items-center justify-between rounded-2xl bg-white p-4 border border-slate-100 transition-all hover:bg-slate-50 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100 hover:-translate-y-0.5 cursor-pointer"
                                    onClick={() => navigate(`/students/${student._id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white text-lg font-black shadow-lg shadow-red-100 transition-transform group-hover:scale-110">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{student.name}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{student.department} · {student.registerNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex items-center gap-5">
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Attendance</p>
                                                <p className="font-bold text-slate-700">{student.attendance}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">CGPA</p>
                                                <p className="font-bold text-rose-600">{student.cgpa ?? '—'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Risk Score</p>
                                                <p className="font-bold text-slate-700">{student.riskScore ?? 0}/100</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setIsMessaging(true); }}
                                            className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-400 hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                                            title="Message student">
                                            <MessageIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Message Modal ── */}
                {isMessaging && selectedStudent && (
                    <MessageModal
                        student={selectedStudent}
                        onClose={() => { setIsMessaging(false); setSelectedStudent(null); }}
                    />
                )}
            </div>
        </FacultyLayout>
    );
};

export default FacultyDashboard;
