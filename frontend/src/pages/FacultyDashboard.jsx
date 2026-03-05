import { useEffect, useState, useMemo } from 'react';
import { getStudents, deleteStudent } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal.jsx';
import FacultyLayout from '../components/FacultyLayout.jsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

/* ─── Inline StatCard (no extra file needed) ─── */
const StatCard = ({ title, value, subtitle, icon: Icon, trend, gradient, iconBg }) => (
    <div className="group rounded-2xl border border-white/60 bg-white/50 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="flex items-start justify-between">
            <div className="space-y-1.5">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</p>
                <p
                    className="text-3xl font-black tracking-tight"
                    style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                    {value}
                </p>
                {subtitle && <p className="text-[11px] font-medium text-slate-400">{subtitle}</p>}
                {trend && (
                    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform duration-500 group-hover:rotate-12 text-white"
                style={{ background: iconBg }}
            >
                <Icon size={22} />
            </div>
        </div>
    </div>
);

/* ─── Lucide-like inline SVG icons (no lucide-react dependency) ─── */
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
const ActivityIcon = ({ size = 24 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);
const MessageIcon = ({ size = 20 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
const EditIcon = ({ size = 16 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const TrashIcon = ({ size = 16 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);

/* ─── Risk badge ─── */
const RiskBadge = ({ level }) => {
    const styles = {
        High: 'bg-red-50 text-red-600 border border-red-200',
        Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
        Low: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide ${styles[level] || styles.Low}`}>
            {level} Risk
        </span>
    );
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await deleteStudent(id);
                setStudents(prev => prev.filter(s => s._id !== id));
            } catch {
                alert('Failed to delete student');
            }
        }
    };

    /* ── Derived stats ── */
    const highRisk = useMemo(() => students.filter(s => s.riskLevel === 'High'), [students]);
    const medRisk = useMemo(() => students.filter(s => s.riskLevel === 'Medium'), [students]);
    const lowRisk = useMemo(() => students.filter(s => s.riskLevel === 'Low'), [students]);

    const avgAttendance = students.length
        ? Math.round(students.reduce((sum, s) => sum + (s.attendance ?? 0), 0) / students.length)
        : 0;
    const avgMarks = students.length
        ? Math.round(students.reduce((sum, s) => sum + (s.marks ?? 0), 0) / students.length)
        : 0;

    /* ── Chart data ── */
    const riskDistribution = [
        { name: 'Low Risk', value: lowRisk.length, fill: '#10b981' },
        { name: 'Medium Risk', value: medRisk.length, fill: '#f59e0b' },
        { name: 'High Risk', value: highRisk.length, fill: '#ef4444' },
    ];

    /* Bar chart: group by department */
    const deptMap = {};
    students.forEach(s => {
        if (!deptMap[s.department]) deptMap[s.department] = { dept: s.department, low: 0, medium: 0, high: 0 };
        if (s.riskLevel === 'High') deptMap[s.department].high++;
        else if (s.riskLevel === 'Medium') deptMap[s.department].medium++;
        else deptMap[s.department].low++;
    });
    const deptBarData = Object.values(deptMap);

    if (loading) return (
        <FacultyLayout>
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                    <p className="text-sm font-semibold text-slate-500">Loading students…</p>
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
                        <h1 className="text-4xl font-black tracking-tight text-slate-800">Faculty Dashboard</h1>
                        <p className="text-slate-400 font-medium text-sm mt-0.5">Monitor student wellness & manage profiles</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-2.5 backdrop-blur border border-white/60 shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Semester 1, 2026</span>
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
                    <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 p-4 text-sm font-medium">{error}</div>
                )}

                {/* ── Stat Cards (3 cards, no Assessment) ── */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Total Students"
                        value={students.length}
                        subtitle={`Across ${new Set(students.map(s => s.department)).size} department(s)`}
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
                        title="High Risk"
                        value={highRisk.length}
                        subtitle="Need immediate attention"
                        icon={AlertIcon}
                        gradient="linear-gradient(135deg, #ef4444, #f97316)"
                        iconBg="linear-gradient(135deg, #ef4444, #f97316)"
                    />
                </div>

                {/* ── Charts Row ── */}
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Bar Chart — Risk by Department */}
                    <div className="rounded-3xl border border-white/60 bg-white/50 p-8 shadow-xl backdrop-blur-md lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-800">Risk Distribution by Department</h3>
                            <div className="h-2 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
                        </div>
                        {deptBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={deptBarData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{
                                            borderRadius: '1rem', border: 'none',
                                            background: 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(12px)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                            padding: '0.75rem 1rem',
                                        }}
                                    />
                                    <Bar dataKey="low" name="Low Risk" fill="#10b981" radius={[6, 6, 6, 6]} />
                                    <Bar dataKey="medium" name="Medium Risk" fill="#f59e0b" radius={[6, 6, 6, 6]} />
                                    <Bar dataKey="high" name="High Risk" fill="#ef4444" radius={[6, 6, 6, 6]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-slate-300 text-sm font-semibold">
                                No data yet — add students to see the chart
                            </div>
                        )}
                    </div>

                    {/* Pie Chart — Current Distribution */}
                    <div className="rounded-3xl border border-white/60 bg-white/50 p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                        <h3 className="mb-6 text-xl font-black text-slate-800">Current Distribution</h3>
                        {students.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={riskDistribution}
                                        cx="50%" cy="42%"
                                        innerRadius={65} outerRadius={95}
                                        paddingAngle={8} dataKey="value"
                                    >
                                        {riskDistribution.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', padding: '0.5rem 0.75rem' }} />
                                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontWeight: 700 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-slate-300 text-sm font-semibold">
                                No data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* ── High Risk Students ── */}
                {highRisk.length > 0 && (
                    <div className="rounded-3xl border border-white/60 bg-white/50 p-8 shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 border border-red-100">
                                    <AlertIcon size={18} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Students Needing Attention</h3>
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-red-400">{highRisk.length} critical</span>
                        </div>
                        <div className="space-y-3">
                            {highRisk.slice(0, 4).map((student) => (
                                <div
                                    key={student._id}
                                    className="group flex items-center justify-between rounded-2xl bg-white/60 p-4 border border-white/80 transition-all hover:bg-white/80 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white text-lg font-black shadow-lg shadow-red-200 transition-transform group-hover:scale-110">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">{student.name}</p>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">{student.department} · {student.registerNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex items-center gap-5">
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Attendance</p>
                                                <p className="font-black text-slate-700">{student.attendance}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Marks</p>
                                                <p className="font-black text-red-500">{student.marks}/100</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Stress</p>
                                                <p className="font-black text-slate-700">{student.stressLevel}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setSelectedStudent(student); setIsMessaging(true); }}
                                            className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-blue-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                                            title="Message student"
                                        >
                                            <MessageIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── All Students Table ── */}
                <div className="rounded-3xl border border-white/60 bg-white/50 p-8 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                                <UsersIcon size={18} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">All Students</h3>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{students.length} total</span>
                    </div>

                    {students.length > 0 ? (
                        <div className="overflow-x-auto rounded-2xl border border-white/80">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 text-left">
                                        {['Student', 'Dept', 'Attendance', 'Marks', 'Stress', 'Risk', 'Actions'].map(h => (
                                            <th key={h} className="px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/80">
                                    {students.map((student) => (
                                        <tr key={student._id} className="group hover:bg-white/70 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-black shadow-sm shadow-blue-200 flex-shrink-0">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{student.name}</p>
                                                        <p className="text-[11px] text-slate-400">{student.registerNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{student.department}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${student.attendance >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`}
                                                            style={{ width: `${student.attendance}%` }}
                                                        />
                                                    </div>
                                                    <span className={`font-bold text-xs ${student.attendance >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {student.attendance}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`font-bold text-sm ${student.marks >= 50 ? 'text-slate-700' : 'text-red-500'}`}>
                                                    {student.marks}<span className="font-normal text-slate-400">/100</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-bold ${student.stressLevel === 'High' ? 'text-red-500' : student.stressLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-600'}`}>
                                                    {student.stressLevel}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <RiskBadge level={student.riskLevel} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedStudent(student); setIsMessaging(true); }}
                                                        className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                                                        title="Message"
                                                    >
                                                        <MessageIcon size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/edit-student/${student._id}`)}
                                                        className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-700 hover:text-white transition-all border border-slate-100"
                                                        title="Edit"
                                                    >
                                                        <EditIcon size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student._id)}
                                                        className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 text-slate-300">
                            <UsersIcon size={40} />
                            <p className="mt-3 text-sm font-semibold">No students yet — create your first profile</p>
                            <Link to="/create-student" className="mt-4 inline-block text-xs font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors">
                                + Create Student
                            </Link>
                        </div>
                    )}
                </div>

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
