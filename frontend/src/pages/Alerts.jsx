import { useEffect, useState, useMemo } from 'react';
import FacultyLayout from '../components/FacultyLayout.jsx';
import { getStudents } from '../services/api';

/* ══════════════════════════════════════════════════════════════
   TYPE CONFIG — each alert type has its own distinct identity
══════════════════════════════════════════════════════════════ */
const typeConfig = {
    // 🔴 General high-risk / stress
    high: { label: 'High Priority', icon: '⚠️', border: 'border-rose-200', bg: 'bg-rose-50', iconBg: 'from-rose-500 to-red-600', text: 'text-rose-600', dot: 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.3)]', badge: 'bg-rose-100/50 text-rose-700 border-rose-200' },
    medium: { label: 'Medium Priority', icon: '🔔', border: 'border-amber-200', bg: 'bg-amber-50', iconBg: 'from-amber-400 to-orange-500', text: 'text-amber-600', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]', badge: 'bg-amber-100/50 text-amber-700 border-amber-200' },

    // 📊 CGPA — blue/indigo
    cgpa_crit: { label: 'CGPA Critical', icon: '📉', border: 'border-blue-200', bg: 'bg-blue-50', iconBg: 'from-blue-600 to-indigo-700', text: 'text-blue-600', dot: 'bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.3)]', badge: 'bg-blue-100/50 text-blue-700 border-blue-200' },
    cgpa_low: { label: 'CGPA Low', icon: '📘', border: 'border-blue-100', bg: 'bg-blue-50/50', iconBg: 'from-blue-500 to-indigo-500', text: 'text-blue-500', dot: 'bg-blue-400', badge: 'bg-blue-100/30 text-blue-600 border-blue-100' },
    cgpa_warn: { label: 'CGPA Warning', icon: '📙', border: 'border-sky-100', bg: 'bg-sky-50/50', iconBg: 'from-sky-500 to-blue-500', text: 'text-sky-500', dot: 'bg-sky-400', badge: 'bg-sky-100/30 text-sky-600 border-sky-100' },

    // 🟠 Attendance — orange/amber
    att_crit: { label: 'Attendance Critical', icon: '🚨', border: 'border-orange-200', bg: 'bg-orange-50', iconBg: 'from-orange-600 to-red-600', text: 'text-orange-600', dot: 'bg-orange-600 animate-pulse shadow-[0_0_8px_rgba(234,88,12,0.3)]', badge: 'bg-orange-100/50 text-orange-700 border-orange-200' },
    att_low: { label: 'Attendance Low', icon: '📆', border: 'border-orange-100', bg: 'bg-orange-50/50', iconBg: 'from-orange-500 to-amber-500', text: 'text-orange-500', dot: 'bg-orange-500', badge: 'bg-orange-100/30 text-orange-600 border-orange-100' },
    att_warn: { label: 'Attendance Warning', icon: '📅', border: 'border-yellow-100', bg: 'bg-yellow-50/50', iconBg: 'from-yellow-500 to-amber-500', text: 'text-yellow-600', dot: 'bg-yellow-500', badge: 'bg-yellow-100/30 text-yellow-700 border-yellow-100' },

    // 🏆 Positive
    success: { label: 'Achievement', icon: '🏆', border: 'border-emerald-200', bg: 'bg-emerald-50', iconBg: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', dot: 'bg-emerald-500', badge: 'bg-emerald-100/50 text-emerald-700 border-emerald-200' },
};

/* ══════════════════════════════════════════════════════════════
   ALERT GENERATOR
══════════════════════════════════════════════════════════════ */
const generateAlerts = (students) => {
    const alerts = [];
    let id = 1;

    students.forEach(s => {
        const att = s.attendance ?? 0;
        const cgpa = Number(s.cgpa) || 0;
        const bl = s.backlogs ?? 0;
        const sleep = s.sleepHours ?? 7;
        const disc = s.disciplinaryIssues ?? 0;
        const marks = s.marks ?? 0;
        const name = s.name;

        /* ════════════════════════════════════
           ATTENDANCE ALERTS (orange family)
        ════════════════════════════════════ */
        if (att < 40) {
            alerts.push({
                id: id++, type: 'att_crit', group: 'attendance', student: s,
                category: 'Extreme Attendance Deficit',
                message: `${name}'s attendance has collapsed to ${att}% — exam debarment is imminent. Urgent faculty + HOD intervention required.`,
                detail: `CGPA: ${cgpa > 0 ? cgpa : '—'}/10 · Backlogs: ${bl} · Risk Score: ${s.riskScore ?? 0}/100`,
            });
        } else if (att < 55) {
            alerts.push({
                id: id++, type: 'att_crit', group: 'attendance', student: s,
                category: 'Critical Attendance',
                message: `${name} is at ${att}% attendance — critically below the 75% threshold. Debarment risk if the trend continues.`,
                detail: `Dept: ${s.department} · Reg: ${s.registerNumber} · Stress: ${s.stressLevel}`,
            });
        } else if (att < 65) {
            alerts.push({
                id: id++, type: 'att_low', group: 'attendance', student: s,
                category: 'Low Attendance',
                message: `${name} has ${att}% attendance — well below the mandatory 75%. Structured follow-up is needed this week.`,
                detail: `CGPA: ${cgpa > 0 ? cgpa : '—'}/10 · Backlogs: ${bl} · Dept: ${s.department}`,
            });
        } else if (att < 75) {
            alerts.push({
                id: id++, type: 'att_warn', group: 'attendance', student: s,
                category: 'Borderline Attendance',
                message: `${name} is at ${att}% attendance — just below the 75% cut-off. One more absence could cross the threshold.`,
                detail: `Dept: ${s.department} · Risk Score: ${s.riskScore ?? 0}/100`,
            });
        }

        /* ════════════════════════════════════
           CGPA ALERTS (blue/indigo family)
        ════════════════════════════════════ */
        if (cgpa > 0 && cgpa < 4) {
            alerts.push({
                id: id++, type: 'cgpa_crit', group: 'cgpa', student: s,
                category: 'CGPA — Failing Grade',
                message: `${name}'s CGPA has fallen to ${cgpa}/10 — entering failing territory. Immediate academic counselling is mandatory.`,
                detail: `Attendance: ${att}% · Backlogs: ${bl} · Marks: ${marks > 0 ? marks : '—'}/100`,
            });
        } else if (cgpa > 0 && cgpa < 5) {
            alerts.push({
                id: id++, type: 'cgpa_crit', group: 'cgpa', student: s,
                category: 'CGPA — Very Low',
                message: `${name}'s CGPA is critically low at ${cgpa}/10. Academic difficulty is severe — remedial support recommended.`,
                detail: `Attendance: ${att}% · Stress: ${s.stressLevel} · Backlogs: ${bl}`,
            });
        } else if (cgpa > 0 && cgpa < 6) {
            alerts.push({
                id: id++, type: 'cgpa_low', group: 'cgpa', student: s,
                category: 'CGPA — Below Average',
                message: `${name} has a CGPA of ${cgpa}/10 — below the 6.0 average. Periodic academic check-ins recommended.`,
                detail: `Attendance: ${att}% · Backlogs: ${bl} · Risk: ${s.riskLevel}`,
            });
        } else if (cgpa > 0 && cgpa < 7) {
            alerts.push({
                id: id++, type: 'cgpa_warn', group: 'cgpa', student: s,
                category: 'CGPA — Below Target',
                message: `${name}'s CGPA is ${cgpa}/10 — borderline acceptable. Encourage improvement to reach the 7.0 target.`,
                detail: `Attendance: ${att}% · Dept: ${s.department}`,
            });
        }



        /* ════════════════════════════════════
           OTHER HIGH PRIORITY
        ════════════════════════════════════ */
        if (s.riskLevel === 'High' && !(cgpa > 0 && cgpa < 6 && att < 75)) {
            alerts.push({
                id: id++, type: 'high', group: 'risk', student: s,
                category: 'High Risk Student',
                message: `${name} is classified as HIGH RISK (score: ${s.riskScore ?? 0}/100). Comprehensive faculty intervention required.`,
                detail: `Dept: ${s.department} · Reg: ${s.registerNumber} · Stress: ${s.stressLevel}`,
            });
        }

        if (bl >= 5) {
            alerts.push({
                id: id++, type: 'high', group: 'backlogs', student: s,
                category: 'Critical Backlogs',
                message: `${name} has ${bl} active backlogs — a heavy academic load risking year hold-back. Immediate remedial plan needed.`,
                detail: `CGPA: ${cgpa > 0 ? cgpa : '—'}/10 · Attendance: ${att}%`,
            });
        } else if (bl >= 3) {
            alerts.push({
                id: id++, type: 'high', group: 'backlogs', student: s,
                category: 'Multiple Backlogs',
                message: `${name} is carrying ${bl} backlogs this semester. Structured revision sessions are recommended.`,
                detail: `CGPA: ${cgpa > 0 ? cgpa : '—'}/10 · Stress: ${s.stressLevel}`,
            });
        } else if (bl >= 1) {
            alerts.push({
                id: id++, type: 'medium', group: 'backlogs', student: s,
                category: 'Pending Backlog',
                message: `${name} has ${bl} pending backlog subject(s). Advise clearing before semester exam.`,
                detail: `Dept: ${s.department} · Risk Score: ${s.riskScore ?? 0}`,
            });
        }

        if (s.stressLevel === 'High') {
            alerts.push({
                id: id++, type: 'high', group: 'stress', student: s,
                category: 'High Stress Level',
                message: `${name} is experiencing HIGH stress based on academic and wellness indicators. Counselling recommended.`,
                detail: `Sleep: ${sleep} hrs/night · Disciplinary Issues: ${disc} · Risk Score: ${s.riskScore ?? 0}`,
            });
        } else if (s.stressLevel === 'Medium') {
            alerts.push({
                id: id++, type: 'medium', group: 'stress', student: s,
                category: 'Elevated Stress',
                message: `${name} shows medium stress signals. Monitor wellness and check in proactively.`,
                detail: `CGPA: ${cgpa > 0 ? cgpa : '—'}/10 · Attendance: ${att}% · Sleep: ${sleep} hrs`,
            });
        }

        if (marks > 0 && marks < 35) {
            alerts.push({
                id: id++, type: 'high', group: 'marks', student: s,
                category: 'Failing Assessment Marks',
                message: `${name} scored only ${marks}/100 — below passing marks. Immediate academic support is needed.`,
                detail: `CGPA: ${cgpa > 0 ? cgpa : '—'}/10 · Backlogs: ${bl}`,
            });
        } else if (marks > 0 && marks < 50) {
            alerts.push({
                id: id++, type: 'medium', group: 'marks', student: s,
                category: 'Low Assessment Marks',
                message: `${name} scored ${marks}/100 — below average performance in recent assessment.`,
                detail: `Dept: ${s.department} · Risk Score: ${s.riskScore ?? 0}`,
            });
        }

        if (sleep < 5) {
            alerts.push({
                id: id++, type: 'high', group: 'wellness', student: s,
                category: 'Severe Sleep Deprivation',
                message: `${name} is averaging only ${sleep} hrs of sleep per night — severely below recommended 7–9 hrs. Health and performance are at risk.`,
                detail: `Stress: ${s.stressLevel} · Attendance: ${att}%`,
            });
        }

        if (disc >= 3) {
            alerts.push({
                id: id++, type: 'high', group: 'discipline', student: s,
                category: 'Multiple Disciplinary Issues',
                message: `${name} has ${disc} disciplinary incidents on record. Escalation to HOD review is recommended.`,
                detail: `Risk Level: ${s.riskLevel} · Dept: ${s.department}`,
            });
        } else if (disc >= 1) {
            alerts.push({
                id: id++, type: 'medium', group: 'discipline', student: s,
                category: 'Disciplinary Issue',
                message: `${name} has ${disc} disciplinary issue(s) recorded. Follow-up to prevent escalation.`,
                detail: `Risk Score: ${s.riskScore ?? 0} · Dept: ${s.department}`,
            });
        }


    });

    // Sort priority: att_crit → cgpa_crit → high → att_low → cgpa_low → medium → att_warn → cgpa_warn → success
    const order = { att_crit: 0, cgpa_crit: 1, high: 2, att_low: 3, cgpa_low: 4, medium: 5, att_warn: 6, cgpa_warn: 7 };
    return alerts.sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9));
};

/* ══════════════════════════════════════════════════════════════
   SECTION HEADER — groups CGPA and Attendance sections
══════════════════════════════════════════════════════════════ */
const SectionHeader = ({ icon, title, subtitle, count, color, bg }) => (
    <div className={`flex items-center gap-4 px-6 py-5 rounded-3xl border ${bg} mb-4 backdrop-blur-2xl shadow-xl`}>
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
            <p className={`text-sm font-bold uppercase tracking-widest ${color}`}>{title}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest opacity-80">{subtitle}</p>
        </div>
        <span className={`text-[10px] font-bold px-4 py-1.5 rounded-full border border-slate-200 bg-white/70 ${color} shadow-sm uppercase tracking-widest`}>{count} NODES</span>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   SINGLE ALERT CARD
══════════════════════════════════════════════════════════════ */
const AlertCard = ({ alert, onDismiss }) => {
    const cfg = typeConfig[alert.type] || typeConfig.medium;
    return (
        <div className={`group flex items-start gap-5 rounded-2xl border ${cfg.border} ${cfg.bg} p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl`}>
            <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.iconBg} text-xl transition-transform duration-500 group-hover:scale-110 shadow-lg`}>
                {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-sm ${cfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                            {cfg.label}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-white/70 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200 shadow-sm">
                            {alert.category}
                        </span>
                    </div>
                    {/* Student chip */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/70 shadow-sm`}>
                        <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${cfg.iconBg} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-lg`}>
                            {alert.student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`text-xs font-bold text-slate-700`}>{alert.student.name}</span>
                        <span className="text-[9px] font-bold text-slate-300 tracking-tighter uppercase whitespace-nowrap">Node_{alert.student.registerNumber}</span>
                    </div>
                </div>
                <p className="text-sm font-bold text-slate-800 leading-relaxed mt-4">{alert.message}</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic leading-tight">{alert.detail}</p>
                <div className="pt-4 flex items-center gap-4">
                    <button onClick={() => onDismiss(alert.id)} className={`text-[9px] font-bold uppercase tracking-widest ${cfg.text} bg-white/70 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm`}>
                        Acknowledge Channel
                    </button>
                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                    <a href={`/students/${alert.student._id}`} className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors bg-white/70 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm">
                        Access Profile →
                    </a>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const Alerts = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState(new Set());
    const [filter, setFilter] = useState('all');
    const [lastRefresh, setLastRefresh] = useState(new Date());

    useEffect(() => { fetchData(); const t = setInterval(fetchData, 120_000); return () => clearInterval(t); }, []);

    const fetchData = () => {
        setLoading(true);
        getStudents()
            .then(({ data }) => { setStudents(data); setLastRefresh(new Date()); })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    const allAlerts = useMemo(() => generateAlerts(students), [students]);
    const active = useMemo(() => allAlerts.filter(a => !dismissed.has(a.id)), [allAlerts, dismissed]);

    const filtered = useMemo(() => {
        if (filter === 'attendance') return active.filter(a => a.group === 'attendance');
        if (filter === 'cgpa') return active.filter(a => a.group === 'cgpa');
        if (filter === 'other') return active.filter(a => !['attendance', 'cgpa'].includes(a.group));
        return active;
    }, [active, filter]);

    /* When showing "all" — split into visual sections */
    const attendanceAlerts = useMemo(() => active.filter(a => a.group === 'attendance'), [active]);
    const cgpaAlerts = useMemo(() => active.filter(a => a.group === 'cgpa'), [active]);
    const otherAlerts = useMemo(() => active.filter(a => !['attendance', 'cgpa'].includes(a.group)), [active]);

    const counts = useMemo(() => ({
        total: active.length,
        attendance: attendanceAlerts.length,
        cgpa: cgpaAlerts.length,
        other: otherAlerts.length,
    }), [active, attendanceAlerts, cgpaAlerts, otherAlerts]);

    const dismiss = (id) => setDismissed(p => new Set([...p, id]));

    const timeSince = (d) => {
        const m = Math.round((new Date() - d) / 60000);
        return m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago`;
    };

    const FILTER_TABS = [
        { key: 'all', label: 'All', count: counts.total, active: 'bg-blue-600 text-white border-blue-500 shadow-xl scale-105' },
        { key: 'attendance', label: 'Attendance', count: counts.attendance, active: 'bg-orange-500 text-white border-orange-500 shadow-xl scale-105' },
        { key: 'cgpa', label: 'CGPA', count: counts.cgpa, active: 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-105' },
        { key: 'other', label: 'Other', count: counts.other, active: 'bg-slate-800 text-white border-slate-700 shadow-xl scale-105' },
    ];

    return (
        <FacultyLayout>
            <div className="space-y-6 pb-12">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Alert <span className="text-blue-600 italic">Telemetry</span></h1>
                        <p className="text-slate-500 font-bold text-sm mt-0.5 italic">
                            Real-time student wellness stream · Monitoring {students.length} nodes
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchData} className="px-6 py-3 rounded-2xl bg-white/70 border border-slate-200 shadow-xl text-[10px] font-bold text-slate-900 hover:bg-slate-50 active:scale-95 transition-all uppercase tracking-widest backdrop-blur-2xl">
                            ↻ Re-Sync Hub
                        </button>
                        <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-5 py-3 backdrop-blur-2xl border border-slate-200 shadow-xl">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{timeSince(lastRefresh)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Summary Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total Alerts', value: counts.total, color: 'text-slate-900', bg: 'bg-white/70', border: 'border-slate-200' },
                        { label: 'Attendance ⚠', value: counts.attendance, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                        { label: 'CGPA ⚠', value: counts.cgpa, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                        { label: 'Other Stream', value: counts.other, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100' },
                    ].map(item => (
                        <div key={item.label} className={`rounded-2xl border ${item.border} ${item.bg} p-3 text-center shadow-lg backdrop-blur-2xl`}>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-tight">{item.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filter Tabs ── */}
                <div className="flex gap-2 flex-wrap">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border shadow-lg ${filter === tab.key ? tab.active : 'bg-white/70 text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            {tab.label}
                            <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold ${filter === tab.key ? 'bg-white/20' : 'bg-slate-100'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                    {dismissed.size > 0 && (
                        <button onClick={() => setDismissed(new Set())} className="px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all shadow-lg backdrop-blur-xl">
                            ↻ Restore Channel_{dismissed.size}
                        </button>
                    )}
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="h-10 w-10 rounded-full border-4 border-blue-500/20 border-t-blue-400 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Decrypting Telemetry Stream…</p>
                    </div>
                ) : filter === 'all' ? (
                    /* ── GROUPED VIEW when "All" is selected ── */
                    <div className="space-y-8">

                        {/* ATTENDANCE SECTION */}
                        {attendanceAlerts.length > 0 && (
                            <div className="space-y-4">
                                <SectionHeader
                                    icon="📆" count={attendanceAlerts.length}
                                    title="Attendance Telemetry"
                                    subtitle="Students with critical attendance shortfall — immediate priority"
                                    color="text-orange-400" bg="border-orange-500/30 bg-orange-500/10"
                                />
                                {attendanceAlerts.map(a => <AlertCard key={a.id} alert={a} onDismiss={dismiss} />)}
                            </div>
                        )}

                        {/* CGPA SECTION */}
                        {cgpaAlerts.length > 0 && (
                            <div className="space-y-4">
                                <SectionHeader
                                    icon="📊" count={cgpaAlerts.length}
                                    title="CGPA Performance Stream"
                                    subtitle="Academic telemetry below institutional benchmarks"
                                    color="text-blue-400" bg="border-blue-500/30 bg-blue-500/10"
                                />
                                {cgpaAlerts.map(a => <AlertCard key={a.id} alert={a} onDismiss={dismiss} />)}
                            </div>
                        )}

                        {/* OTHER ALERTS */}
                        {otherAlerts.length > 0 && (
                            <div className="space-y-4">
                                <SectionHeader
                                    icon="🔔" count={otherAlerts.length}
                                    title="Wellness & Risk Stream"
                                    subtitle="Stress, Backlogs, Disciplinary and Health telemetry"
                                    color="text-white/60" bg="border-white/10 bg-white/5"
                                />
                                {otherAlerts.map(a => <AlertCard key={a.id} alert={a} onDismiss={dismiss} />)}
                            </div>
                        )}

                        {active.length === 0 && (
                            <div className="text-center py-24 rounded-[3rem] border border-slate-200 bg-white/70 backdrop-blur-3xl shadow-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/5 to-transparent pointer-events-none" />
                                <p className="text-7xl mb-6">✨</p>
                                <p className="font-bold text-slate-900 text-2xl uppercase tracking-widest">Channel Clear</p>
                                <p className="text-slate-400 text-sm mt-3 font-bold uppercase tracking-widest">Institutional telemetry shows 100% stability.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── FILTERED VIEW ── */
                    <div className="space-y-3">
                        {filtered.length === 0 ? (
                            <div className="text-center py-20 rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl shadow-xl">
                                <p className="text-6xl mb-4">✅</p>
                                <p className="font-bold text-slate-900 text-xl">No alerts in this category</p>
                                <p className="text-slate-400 text-sm mt-2 font-bold">Looks like everything is clear.</p>
                            </div>
                        ) : (
                            filtered.map(a => <AlertCard key={a.id} alert={a} onDismiss={dismiss} />)
                        )}
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
};

export default Alerts;
