import FacultyLayout from '../components/FacultyLayout.jsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { getStudents } from '../services/api';
import AiInsights from '../components/AiInsights.jsx';

/* ═══════════════════════════════════════════════════════
   STRESS FACTOR CALCULATOR
   Maps real student fields → 6 radar axes (0–100 severity)
   Higher = more stressed in that domain
═══════════════════════════════════════════════════════ */
const computeStressFactors = (students) => {
    if (!students.length) return [
        { factor: 'Academics', value: 0 },
        { factor: 'Sleep', value: 0 },
        { factor: 'Social', value: 0 },
        { factor: 'Engagement', value: 0 },
        { factor: 'Discipline', value: 0 },
        { factor: 'Mental Health', value: 0 },
    ];
    const n = students.length;

    /* 1. Academics — driven by CGPA, attendance, backlogs */
    const academicStress = students.reduce((sum, s) => {
        const cgpaStress = Math.max(0, ((10 - (Number(s.cgpa) || 0)) / 10) * 40);
        const attStress = Math.max(0, ((100 - (s.attendance ?? 100)) / 100) * 35);
        const backlogStress = Math.min(25, (Number(s.backlogs) || 0) * 5);
        return sum + cgpaStress + attStress + backlogStress;
    }, 0) / n;

    /* 2. Sleep — poor sleep = high stress (optimal: 7–9 hrs) */
    const sleepStress = students.reduce((sum, s) => {
        const hrs = Number(s.sleepHours) || 7;
        if (hrs < 4 || hrs > 12) return sum + 90;
        if (hrs < 6 || hrs > 10) return sum + 60;
        if (hrs < 7 || hrs > 9) return sum + 30;
        return sum + 5;
    }, 0) / n;

    /* 3. Social — based on class & sports participation */
    const socialStress = students.reduce((sum, s) => {
        let s2 = 50; // default mid
        const cp = s.classParticipation || 'Average';
        if (cp === 'Poor') s2 += 30;
        else if (cp === 'Average') s2 += 10;
        else if (cp === 'Good') s2 -= 10;
        else s2 -= 25; // Excellent
        const sp = s.sportsParticipation || 'None';
        if (sp === 'None') s2 += 15;
        else if (sp === 'Regular') s2 -= 15;
        return sum + Math.max(0, Math.min(100, s2));
    }, 0) / n;

    /* 4. Engagement — competition participation & class engagement */
    const engagementStress = students.reduce((sum, s) => {
        let e = 50;
        const comp = s.competitionParticipation || 'None';
        if (comp === 'None') e += 20;
        else if (comp === 'Regular') e -= 25;
        const cp = s.classParticipation || 'Average';
        if (cp === 'Poor') e += 25;
        else if (cp === 'Excellent') e -= 20;
        return sum + Math.max(0, Math.min(100, e));
    }, 0) / n;

    /* 5. Discipline — disciplinary issues */
    const disciplineStress = students.reduce((sum, s) => {
        const d = Number(s.disciplinaryIssues) || 0;
        if (d === 0) return sum + 5;
        if (d === 1) return sum + 40;
        if (d === 2) return sum + 65;
        return sum + 90;
    }, 0) / n;

    /* 6. Mental Health — driven by stressLevel + sleep + disciplinary */
    const mentalStress = students.reduce((sum, s) => {
        const stressMap = { High: 80, Medium: 45, Low: 10 };
        const base = stressMap[s.stressLevel] || 45;
        const sleepPenalty = (() => {
            const hrs = Number(s.sleepHours) || 7;
            if (hrs < 5) return 15;
            if (hrs < 7) return 7;
            return 0;
        })();
        const discPenalty = Math.min(15, (Number(s.disciplinaryIssues) || 0) * 5);
        return sum + Math.min(100, base + sleepPenalty + discPenalty);
    }, 0) / n;

    return [
        { factor: 'Academics', value: Math.round(academicStress) },
        { factor: 'Sleep', value: Math.round(sleepStress) },
        { factor: 'Social', value: Math.round(socialStress) },
        { factor: 'Engagement', value: Math.round(engagementStress) },
        { factor: 'Discipline', value: Math.round(disciplineStress) },
        { factor: 'Mental Health', value: Math.round(mentalStress) },
    ];
};



const tooltipStyle = {
    borderRadius: '1rem',
    border: '1px solid rgba(0,0,0,0.05)',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    padding: '0.75rem 1rem',
    color: '#0f172a',
    fontSize: '11px',
    fontWeight: '700'
};

/* ═══════════════════════════════
   Custom Radar Tooltip
═══════════════════════════════ */
const RadarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { factor, value } = payload[0].payload;
    const label = value >= 70 ? 'CRITICAL' : value >= 45 ? 'MODERATE' : 'OPTIMAL';
    const color = value >= 70 ? 'text-rose-600' : value >= 45 ? 'text-amber-600' : 'text-emerald-600';
    return (
        <div className="rounded-xl border border-slate-200 bg-white/95 px-4 py-2 shadow-xl backdrop-blur-3xl">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-1">{factor}</p>
            <p className={`text-[11px] font-extrabold ${color}`}>LEVEL: {value}/100 — {label}</p>
        </div>
    );
};

const Analytics = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStudents()
            .then(({ data }) => setStudents(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    /* ── Derived ── */
    const sorted = useMemo(() =>
        [...students].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0) || b.attendance - a.attendance),
        [students]);

    const highCount = students.filter(s => s.riskLevel === 'High').length;
    const medCount = students.filter(s => s.riskLevel === 'Medium').length;
    const lowCount = students.filter(s => s.riskLevel === 'Low').length;

    /* Dept bar — avg CGPA per dept + Overall */
    const deptData = useMemo(() => {
        const map = {};
        let totalCgpaSum = 0;
        let totalMarkSum = 0;

        students.forEach(s => {
            if (!map[s.department]) map[s.department] = { dept: s.department, total: 0, cgpaSum: 0, markSum: 0 };
            map[s.department].total++;
            map[s.department].cgpaSum += Number(s.cgpa) || 0;
            map[s.department].markSum += s.marks ?? 0;

            totalCgpaSum += Number(s.cgpa) || 0;
            totalMarkSum += s.marks ?? 0;
        });

        const perDept = Object.values(map).map(d => ({
            department: d.dept,
            avgCGPA: +((d.cgpaSum / d.total).toFixed(2)),
            avgMarks: Math.round(d.markSum / d.total),
        }));

        if (students.length > 0) {
            perDept.push({
                department: 'Overall',
                avgCGPA: +((totalCgpaSum / students.length).toFixed(2)),
                avgMarks: Math.round(totalMarkSum / students.length),
            });
        }

        return perDept;
    }, [students]);

    /* Stress Factors — computed from real data */
    const stressFactors = useMemo(() => computeStressFactors(students), [students]);

    /* Dominant stress factor */
    const dominantFactor = useMemo(() =>
        stressFactors.reduce((max, f) => f.value > max.value ? f : max, stressFactors[0] ?? { factor: '—', value: 0 }),
        [stressFactors]);

    /* Overall metrics */
    const { avgRiskScore, wellnessScore, overallCGPA, overallMarks } = useMemo(() => {
        if (!students.length) return { avgRiskScore: 0, wellnessScore: 0, overallCGPA: '0.00', overallMarks: 0 };

        const riskSum = students.reduce((sum, s) => sum + (s.riskScore ?? 0), 0);
        const cgpaSum = students.reduce((sum, s) => sum + (Number(s.cgpa) || 0), 0);
        const marksSum = students.reduce((sum, s) => sum + (s.marks ?? 0), 0);

        const avgRisk = Math.round(riskSum / students.length);
        return {
            avgRiskScore: avgRisk,
            wellnessScore: Math.max(0, 100 - avgRisk),
            overallCGPA: (cgpaSum / students.length).toFixed(2),
            overallMarks: Math.round(marksSum / students.length)
        };
    }, [students]);

    if (loading) return (
        <FacultyLayout>
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Decrypting Institutional Data…</p>
            </div>
        </FacultyLayout>
    );

    return (
        <FacultyLayout>
            <div className="space-y-8 pb-12">

                {/* AI Monitoring */}
                <AiInsights />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Analytics</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 italic">Institutional Intelligence · Node Count: {students.length}</p>
                    </div>
                    {/* Wellness Snapshot */}
                    <div className="flex flex-wrap gap-4">
                        {[
                            { label: 'Intelligence Index', value: `${wellnessScore}%`, color: wellnessScore >= 60 ? 'text-emerald-600' : 'text-rose-600' },
                            { label: 'Biometric Risk', value: `${avgRiskScore}/100`, color: avgRiskScore >= 65 ? 'text-rose-600' : avgRiskScore >= 40 ? 'text-amber-600' : 'text-emerald-600' },
                            { label: 'Global CGPA', value: `${overallCGPA}`, color: 'text-blue-600' },
                            { label: 'Mean Efficiency', value: `${overallMarks}%`, color: 'text-indigo-600' },
                        ].map(item => (
                            <div key={item.label} className="rounded-2xl bg-white/70 border border-slate-200 shadow-xl backdrop-blur-3xl px-6 py-4 text-center group relative overflow-hidden transition-all hover:bg-white hover:border-blue-200">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2 drop-shadow-sm">{item.label}</p>
                                <p className={`text-3xl font-bold ${item.color} drop-shadow-md`}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dept CGPA bar */}
                {deptData.length > 0 && (
                    <div className="rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Departmental Yield</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Cross-sector node performance analysis</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CGPA INDEX</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(129,140,248,0.2)]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">EFFICIENCY %</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={deptData} barGap={12}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(0,0,0,0.4)', letterSpacing: '0.1em' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(0,0,0,0.4)' }} />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                    <Bar dataKey="avgCGPA" name="Avg CGPA" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={24} />
                                    <Bar dataKey="avgMarks" name="Avg Marks" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Stress Factors — full width */}
                <div className="grid gap-8">

                    {/* Stress Radar — LIVE DATA */}
                    <div className="rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                        <div className="flex items-start justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Stress Mapping</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Real-time holistic metabolic variance</p>
                            </div>
                            {/* Dominant factor chip */}
                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border backdrop-blur-3xl shadow-xl relative overflow-hidden group ${dominantFactor.value >= 70 ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                dominantFactor.value >= 45 ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                    'bg-emerald-50 border-emerald-200 text-emerald-600'
                                }`}>
                                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10 font-extrabold">DOMINANT_PEAK: {dominantFactor.factor} [{dominantFactor.value}]</span>
                            </div>
                        </div>

                        {/* Factor breakdown bars */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 relative z-10">
                            {stressFactors.map(f => (
                                <div key={f.factor} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:bg-white hover:border-blue-200">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                                        <span>{f.factor}</span>
                                        <span className={f.value >= 70 ? 'text-rose-600' : f.value >= 45 ? 'text-amber-600' : 'text-emerald-600'}>
                                            {f.value}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${f.value >= 70 ? 'bg-rose-500' :
                                                f.value >= 45 ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                                }`}
                                            style={{ width: `${f.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative z-10">
                            {students.length > 0 ? (
                                <ResponsiveContainer width="100%" height={320}>
                                    <RadarChart data={stressFactors} cx="50%" cy="50%" outerRadius="80%">
                                        <PolarGrid stroke="rgba(0,0,0,0.05)" />
                                        <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(0,0,0,0.4)', letterSpacing: '0.1em' }} />
                                        <Radar dataKey="value" stroke="#3b82f6" strokeWidth={4} fill="#3b82f6" fillOpacity={0.1} dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} />
                                        <Tooltip content={<RadarTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-48 text-slate-300 text-[10px] font-bold uppercase tracking-widest italic">
                                    Awaiting node data for mapping…
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Performers + Risk Clusters */}
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Top Performers — sorted by CGPA */}
                    <div className="rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                        <h3 className="mb-8 text-2xl font-bold text-slate-900 uppercase tracking-tight relative z-10">Elite Cadre</h3>
                        <div className="space-y-4 relative z-10">
                            {[...students]
                                .sort((a, b) => (Number(b.cgpa) || 0) - (Number(a.cgpa) || 0) || (b.attendance ?? 0) - (a.attendance ?? 0))
                                .slice(0, 5)
                                .map((s, i) => (
                                    <div key={s._id} className="flex items-center justify-between p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:scale-[1.02] hover:bg-slate-50 hover:border-blue-200 cursor-pointer relative overflow-hidden group/item active:scale-95" onClick={() => navigate(`/students/${s._id}`)}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-5">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-bold shadow-lg text-base relative overflow-hidden border border-white/20 ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20 rotate-6' :
                                                i === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 shadow-slate-300/20 -rotate-3' :
                                                    i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-500/20 rotate-12' :
                                                        'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}>
                                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                                                <span className="relative z-10">{i + 1}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-lg tracking-tight mb-1 group-hover/item:text-blue-600 transition-colors">{s.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.department} DEPT · ATT: {s.attendance}%</div>
                                            </div>
                                        </div>
                                        <div className="text-right bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                            <p className="font-bold text-blue-600 text-2xl">{s.cgpa ?? '—'}<span className="text-xs text-slate-300">/10</span></p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CGPA</p>
                                        </div>
                                    </div>
                                ))
                            }
                            {students.length === 0 && <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-center py-12 italic">No cadre data available…</div>}
                        </div>
                    </div>
                </div>

                {/* ── Risk Clusters — separate cards ── */}
                <div className="space-y-8">
                    {[
                        {
                            label: 'CRITICAL', emoji: '🚨',
                            count: highCount,
                            border: 'border-rose-200', bg: 'bg-rose-50',
                            headerBg: 'bg-rose-600 shadow-rose-200',
                            pillBg: 'bg-rose-100/50 text-rose-700 border-rose-200',
                            avatarBg: 'from-rose-500 to-rose-700',
                            textColor: 'text-rose-600',
                            barColor: 'bg-rose-500 shadow-sm',
                            data: students.filter(s => s.riskLevel === 'High').sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)),
                        },
                        {
                            label: 'MONITORING', emoji: '⚠️',
                            count: medCount,
                            border: 'border-amber-200', bg: 'bg-amber-50',
                            headerBg: 'bg-amber-500 shadow-amber-200',
                            pillBg: 'bg-amber-100/50 text-amber-700 border-amber-200',
                            avatarBg: 'from-amber-400 to-amber-600',
                            textColor: 'text-amber-600',
                            barColor: 'bg-amber-500 shadow-sm',
                            data: students.filter(s => s.riskLevel === 'Medium').sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)),
                        },
                        {
                            label: 'HEALTHY', emoji: '✅',
                            count: lowCount,
                            border: 'border-emerald-200', bg: 'bg-emerald-50',
                            headerBg: 'bg-emerald-500 shadow-emerald-200',
                            pillBg: 'bg-emerald-100/50 text-emerald-700 border-emerald-200',
                            avatarBg: 'from-emerald-400 to-emerald-600',
                            textColor: 'text-emerald-600',
                            barColor: 'bg-emerald-500 shadow-sm',
                            data: students.filter(s => s.riskLevel === 'Low').sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0)),
                        },
                    ].map(cluster => (
                        <div key={cluster.label} className={`rounded-[3rem] border ${cluster.border} ${cluster.bg} p-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden group/cluster`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                            {/* Cluster header */}
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className={`h-12 w-12 rounded-[1.25rem] ${cluster.headerBg} flex items-center justify-center text-white text-base font-bold border border-white/20`}>
                                        <span className="relative z-10">{cluster.count}</span>
                                    </div>
                                    <div>
                                        <h4 className={`text-2xl font-bold uppercase tracking-widest ${cluster.textColor}`}>
                                            {cluster.emoji} {cluster.label} SECTOR
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{cluster.count} Active Nodes Detected</p>
                                    </div>
                                </div>
                                <span className={`px-5 py-2 rounded-2xl text-[10px] font-bold border uppercase tracking-widest backdrop-blur-3xl shadow-sm ${cluster.pillBg}`}>
                                    {cluster.count === 0 ? 'ZERO NODES' : `CLUSTER_SIZE: ${cluster.count}`}
                                </span>
                            </div>

                            {/* Student rows */}
                            {cluster.data.length > 0 ? (
                                <div className="space-y-3 relative z-10">
                                    {cluster.data.map((s, idx) => (
                                        <div key={s._id} className="flex items-center justify-between bg-white/50 rounded-[2rem] px-8 py-5 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all cursor-pointer group/row active:scale-[0.99] shadow-sm" onClick={() => navigate(`/students/${s._id}`)}>
                                            {/* Rank + Avatar + Name */}
                                            <div className="flex items-center gap-6">
                                                <span className="text-[10px] font-bold text-slate-300 w-8 text-center">{idx + 1}</span>
                                                <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${cluster.avatarBg} text-white text-base font-bold flex items-center justify-center shadow-lg flex-shrink-0 border border-white/20 relative overflow-hidden`}>
                                                    <span className="relative z-10">{s.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-slate-900 group-hover/row:text-blue-600 transition-colors tracking-tight">{s.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.department} · {s.registerNumber}</p>
                                                </div>
                                            </div>

                                            {/* Metrics */}
                                            <div className="hidden lg:flex items-center gap-10">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-1">SCORE_CGPA</p>
                                                    <p className="text-base font-bold text-slate-700">{s.cgpa ?? '—'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-1">ATTENDANCE</p>
                                                    <p className={`text-base font-black ${s.attendance >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{s.attendance}%</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-1">METABOLIC</p>
                                                    <p className={`text-base font-bold ${s.stressLevel === 'High' ? 'text-rose-600' : s.stressLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                        {s.stressLevel}
                                                    </p>
                                                </div>
                                                {/* Risk score with bar */}
                                                <div className="text-right min-w-[100px]">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-1">RISK_TELEMETRY</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                                                            <div className={`h-full rounded-full ${cluster.barColor}`} style={{ width: `${s.riskScore ?? 0}%` }} />
                                                        </div>
                                                        <span className={`text-[10px] font-bold ${cluster.textColor}`}>{s.riskScore ?? 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`text-center py-10 text-[10px] font-black uppercase tracking-[0.3em] ${cluster.textColor} opacity-40 italic relative z-10`}>
                                    SURVEILLANCE_IDLE: No nodes detected in this sector
                                </div>
                            )}
                        </div>
                    ))}
                </div>


                {/* Full Academic Ledger */}
                {sorted.length > 0 && (
                    <div className="rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent pointer-events-none" />
                        <h3 className="mb-8 text-3xl font-bold text-slate-900 uppercase tracking-tight relative z-10 leading-none">Global Node Ledger</h3>
                        <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white/50 relative z-10 shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        {['NODE_ID', 'AUTHORIZED_ENTITY', 'CGPA_YIELD', 'PRESENCE_INDEX', 'BACKLOG_COUNT', 'METABOLIC_COEFF', 'RISK_PROJECTION', 'STATUS_CODE'].map(h => (
                                            <th key={h} className="px-6 py-5 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sorted.map((s, i) => (
                                        <tr key={s._id} className="group hover:bg-white transition-all cursor-pointer" onClick={() => navigate(`/students/${s._id}`)}>
                                            <td className="px-6 py-4 font-bold text-slate-300 text-[10px]">#{(i + 1).toString().padStart(3, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-base font-bold text-blue-600 border border-blue-100 shadow-sm relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                                                        <span className="relative z-10">{s.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight text-base">{s.name}</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.department} SECTOR</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-blue-600 text-base tabular-nums">{s.cgpa ?? '0.0'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${s.attendance >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${s.attendance}%` }} />
                                                    </div>
                                                    <span className={`text-[10px] font-bold tabular-nums ${s.attendance >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{s.attendance}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-400 text-base tabular-nums">{s.backlogs ?? 0}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${s.stressLevel === 'High' ? 'bg-rose-50 text-rose-600 border-rose-200' : s.stressLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                    {s.stressLevel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1px]">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${(s.riskScore ?? 0) >= 65 ? 'bg-rose-500' : (s.riskScore ?? 0) >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${s.riskScore ?? 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-300 tabular-nums">{s.riskScore ?? 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-4 py-1.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest border backdrop-blur-3xl shadow-sm ${s.riskLevel === 'High' ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-rose-100' :
                                                    s.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100'
                                                    }`}>{s.riskLevel}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
};

export default Analytics;
