import { useEffect, useState, useMemo } from 'react';
import FacultyLayout from '../components/FacultyLayout.jsx';
import { getStudents } from '../services/api';


/* ══════════════════════════════════════════════════════════════
   PDF GENERATOR — direct download, no browser dialog
══════════════════════════════════════════════════════════════ */
const downloadPDF = async (report) => {
    // Dynamically import so heavy jsPDF library doesn't block app startup
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const strip = (s) => String(s).replace(/[^\x00-\x7F]/g, '').trim();
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // Header band
    const bandColor =
        report.type === 'High' ? [239, 68, 68] :
            report.type === 'Medium' ? [245, 158, 11] :
                report.type === 'Low' ? [16, 185, 129] :
                    report.type === 'Performers' ? [124, 58, 237] :
                        report.type === 'Backlogs' ? [249, 115, 22] :
                            [59, 130, 246];

    doc.setFillColor(...bandColor);
    doc.rect(0, 0, pageW, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(strip(report.title), 10, 14);

    // Meta line
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${report.date}   .   Students: ${report.count}`, pageW - 10, 14, { align: 'right' });

    // Description
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text(strip(report.description), 10, 30, { maxWidth: pageW - 20 });


    // Table
    const cols = report.csvHeaders;
    const rows = report.rows.map(r => cols.map(c => String(r[c] ?? '—')));

    const headColors = {
        High: [254, 226, 226],
        Medium: [254, 243, 199],
        Low: [209, 250, 229],
        Performers: [237, 233, 254],
        Backlogs: [255, 237, 213],
        Overall: [219, 234, 254],
    };
    const hc = headColors[report.type] || [219, 234, 254];

    autoTable(doc, {
        startY: 38,
        head: [cols],
        body: rows,
        styles: {
            fontSize: 7.5,
            cellPadding: 2.5,
            lineColor: [241, 245, 249],
            lineWidth: 0.3,
            textColor: [30, 41, 59],
        },
        headStyles: {
            fillColor: hc,
            textColor: [71, 85, 105],
            fontStyle: 'bold',
            fontSize: 7,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didDrawCell: (data) => {
            // Color-code Risk Level column
            const colName = cols[data.column.index];
            if (colName === 'Risk Level' && data.section === 'body') {
                const val = data.cell.raw;
                const c = val === 'High' ? [239, 68, 68] : val === 'Medium' ? [245, 158, 11] : [16, 185, 129];
                doc.setFillColor(...c);
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(6.5);
                doc.setFont('helvetica', 'bold');
                const x = data.cell.x + 1;
                const y = data.cell.y + 1;
                const w = data.cell.width - 2;
                const h = data.cell.height - 2;
                doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F');
                doc.text(val, x + w / 2, y + h / 2 + 2, { align: 'center' });
            }
        },
        margin: { left: 10, right: 10 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Wellness AI · Confidential · Page ${i} of ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
    }

    doc.save(`${report.title.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_')}_${report.date}.pdf`);
};

/* ══════════════════════════════════════════════════════════════
   TYPE CONFIG
══════════════════════════════════════════════════════════════ */
const typeCfg = {
    High: { pill: 'text-rose-600 bg-rose-50 border-rose-200', band: 'from-rose-50 to-rose-100', icon: 'text-rose-600', grad: 'from-rose-500/10 to-red-500/5' },
    Medium: { pill: 'text-amber-600 bg-amber-50 border-amber-200', band: 'from-amber-50 to-amber-100', icon: 'text-amber-600', grad: 'from-amber-400/10 to-orange-400/5' },
    Low: { pill: 'text-emerald-600 bg-emerald-50 border-emerald-200', band: 'from-emerald-50 to-emerald-100', icon: 'text-emerald-600', grad: 'from-emerald-500/10 to-teal-500/5' },
    Performers: { pill: 'text-blue-600 bg-blue-50 border-blue-200', band: 'from-blue-50 to-indigo-100', icon: 'text-blue-600', grad: 'from-blue-500/10 to-indigo-500/5' },
    Backlogs: { pill: 'text-orange-600 bg-orange-50 border-orange-200', band: 'from-orange-50 to-red-100', icon: 'text-orange-600', grad: 'from-orange-400/10 to-red-400/5' },
    Overall: { pill: 'text-slate-600 bg-slate-50 border-slate-200', band: 'from-slate-50 to-slate-100', icon: 'text-slate-400', grad: 'from-slate-100 to-slate-50' },
};

/* ── Icons ── */
const FileIcon = ({ color }) => (
    <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className={color}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const BackIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

/* ══════════════════════════════════════════════════════════════
   FULL-PAGE DETAIL VIEW
══════════════════════════════════════════════════════════════ */
const DetailPage = ({ report, onBack }) => {
    const cfg = typeCfg[report.type] || typeCfg.Overall;
    const cols = report.csvHeaders;

    return (
        <div className="space-y-6 pb-12">
            {/* Top bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/70 border border-slate-200 shadow-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95 backdrop-blur-3xl"
                >
                    <BackIcon /> Return to Archives
                </button>
                <button
                    onClick={() => downloadPDF(report)}
                    className="flex items-center gap-3 px-8 py-3 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 transition-all border border-white/20 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                >
                    ⬇ Downlink Report (.PDF)
                </button>
            </div>

            {/* Hero banner */}
            <div className={`rounded-[3rem] p-10 bg-gradient-to-br ${cfg.band} border border-slate-100 text-slate-900 shadow-xl backdrop-blur-3xl relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                <span className={`inline-block px-4 py-1.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest backdrop-blur-3xl border mb-6 ${cfg.pill}`}>
                    {report.type} PROTOCOL ARCHIVE
                </span>
                <h1 className="text-5xl font-bold leading-tight tracking-tighter">{report.title}</h1>
                <p className="mt-4 text-[11px] text-slate-500 font-bold uppercase tracking-widest max-w-3xl italic">{report.description}</p>
                <div className="flex gap-8 mt-10 flex-wrap">
                    {[
                        { label: 'NODE_COUNT', value: report.count },
                        { label: 'TIMESTAMP', value: report.date },
                        { label: 'FIELD_DEPTH', value: cols.length },
                    ].map(s => (
                        <div key={s.label} className="bg-white/70 backdrop-blur-3xl rounded-3xl px-8 py-4 text-center border border-slate-200 shadow-xl">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full table */}
            <div className="rounded-[3rem] border border-slate-200 bg-white/70 shadow-xl backdrop-blur-3xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="p-8 border-b border-slate-100 flex items-center justify-between relative z-10">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tighter leading-none">Global Ledger View</h2>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl uppercase tracking-widest">{report.count} ACTIVE_NODES</span>
                </div>
                <div className="overflow-x-auto relative z-10 p-2">
                    {report.rows.length > 0 ? (
                        <div className="rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {cols.map(c => (
                                            <th key={c} className="px-6 py-5 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{c}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {report.rows.map((row, i) => (
                                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                            {cols.map(c => {
                                                const v = row[c] ?? '—';
                                                if (c === 'Risk Level') {
                                                    const rc = v === 'High' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                        v === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                            'bg-emerald-50 text-emerald-600 border-emerald-200';
                                                    return <td key={c} className="px-6 py-4"><span className={`px-4 py-1 rounded-2xl text-[9px] font-bold border uppercase tracking-widest backdrop-blur-3xl shadow-sm ${rc}`}>{v}</span></td>;
                                                }
                                                if (c === 'Stress Level') {
                                                    const sc = v === 'High' ? 'text-rose-600' : v === 'Medium' ? 'text-amber-600' : 'text-emerald-600';
                                                    return <td key={c} className={`px-6 py-4`}><span className={`text-[10px] font-bold uppercase tracking-widest ${sc}`}>{v}</span></td>;
                                                }
                                                if (c === 'Attendance') {
                                                    const num = parseInt(v) || 0;
                                                    return (
                                                        <td key={c} className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-16 h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden p-[1px] shadow-inner">
                                                                    <div className={`h-full rounded-full transition-all duration-1000 ${num >= 75 ? 'bg-emerald-500 shadow-sm' : 'bg-rose-500 shadow-sm'}`} style={{ width: `${num}%` }} />
                                                                </div>
                                                                <span className={`text-[10px] font-bold tabular-nums tracking-tighter ${num >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{v}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                }
                                                if (c === 'Rank') return <td key={c} className="px-6 py-4 font-bold text-slate-400 text-[10px] tabular-nums">{v}</td>;
                                                return <td key={c} className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap text-xs tracking-tight">{v}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-24 text-white/20 font-black uppercase tracking-[0.3em] italic">
                            <p className="text-6xl mb-6 drop-shadow-2xl">📭</p>
                            <p>DATABASE_NULL: No records in sector</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   REPORT LIST CARD
══════════════════════════════════════════════════════════════ */
const ReportCard = ({ report, onView }) => {
    const cfg = typeCfg[report.type] || typeCfg.Overall;
    return (
        <div className="group flex flex-col lg:flex-row lg:items-center justify-between gap-8 rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-3xl transition-all hover:bg-white hover:shadow-2xl hover:-translate-y-1.5 hover:border-blue-500/30 relative overflow-hidden active:scale-[0.99] duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="flex items-start gap-8 flex-1 relative z-10">
                <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br ${cfg.grad} shadow-xl transition-transform group-hover:scale-110 duration-700 border border-slate-100 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-md" />
                    <FileIcon color={cfg.icon} />
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className={`px-4 py-1.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest border backdrop-blur-3xl shadow-sm ${cfg.pill}`}>
                            {report.type} PROTOCOL
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl uppercase tracking-widest">
                            {report.count} ACTIVE_NODES
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-none tracking-tighter">
                        {report.title}
                    </h3>
                    <p className="text-slate-500 font-medium max-w-2xl leading-relaxed text-xs uppercase tracking-widest italic">
                        {report.description}
                    </p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest pt-1">
                        🔒 NODE_ACCESS: AUTHORIZED FACULTY ONLY
                    </p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative z-10">
                <button
                    onClick={() => downloadPDF(report)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl h-14 px-8 border border-slate-200 bg-white/70 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all shadow-xl active:scale-95 backdrop-blur-3xl"
                >
                    ⬇ Downlink PDF
                </button>
                <button
                    onClick={() => onView(report)}
                    className="w-full sm:w-auto rounded-2xl h-14 px-10 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl transition-all hover:scale-105 border border-white/20 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                >
                    Initialize View_Detail
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const Reports = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailReport, setDetailReport] = useState(null);

    useEffect(() => {
        getStudents()
            .then(({ data }) => setStudents(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const today = new Date().toISOString().split('T')[0];

    const buildRow = (s) => ({
        Name: s.name, 'Reg No': s.registerNumber, Department: s.department,
        Attendance: `${s.attendance ?? 0}%`, CGPA: s.cgpa ?? '—', Marks: s.marks ?? '—',
        Backlogs: s.backlogs ?? 0, 'Stress Level': s.stressLevel,
        'Risk Level': s.riskLevel, 'Risk Score': s.riskScore ?? 0,
        'Sleep Hours': s.sleepHours ?? '—', 'Class Part.': s.classParticipation || '—',
        'Sports Part.': s.sportsParticipation || '—', Disciplinary: s.disciplinaryIssues ?? 0,
    });

    const reports = useMemo(() => {
        const high = students.filter(s => s.riskLevel === 'High').sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));
        const medium = students.filter(s => s.riskLevel === 'Medium').sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));
        const low = students.filter(s => s.riskLevel === 'Low').sort((a, b) => (a.riskScore ?? 0) - (b.riskScore ?? 0));
        const topPerf = [...students].sort((a, b) => (Number(b.cgpa) || 0) - (Number(a.cgpa) || 0) || (b.attendance ?? 0) - (a.attendance ?? 0));
        const backlog = students.filter(s => (s.backlogs ?? 0) > 0).sort((a, b) => (b.backlogs ?? 0) - (a.backlogs ?? 0));
        const overall = [...students].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));

        const avgAtt = students.length ? Math.round(students.reduce((s, x) => s + (x.attendance ?? 0), 0) / students.length) : 0;
        const avgCGPA = students.length ? (students.reduce((s, x) => s + (Number(x.cgpa) || 0), 0) / students.length).toFixed(2) : '—';
        const totalBL = students.reduce((s, x) => s + (x.backlogs ?? 0), 0);

        return [
            {
                id: 1, type: 'High', date: today, count: high.length,
                title: 'High Risk Students Report',
                description: `${high.length} student(s) classified as High Risk (score ≥ 65). These students show critical combinations of low attendance, poor CGPA, or multiple backlogs and require immediate faculty intervention.`,
                rows: high.map(buildRow),
                csvHeaders: ['Name', 'Reg No', 'Department', 'Attendance', 'CGPA', 'Marks', 'Backlogs', 'Stress Level', 'Risk Level', 'Risk Score'],
            },
            {
                id: 2, type: 'Medium', date: today, count: medium.length,
                title: 'Medium Risk Students Report',
                description: `${medium.length} student(s) are in the Medium Risk zone (score 40–64). They are showing warning signs in academics or wellness and need monitoring and proactive support.`,
                rows: medium.map(buildRow),
                csvHeaders: ['Name', 'Reg No', 'Department', 'Attendance', 'CGPA', 'Marks', 'Backlogs', 'Stress Level', 'Risk Level', 'Risk Score'],
            },
            {
                id: 3, type: 'Low', date: today, count: low.length,
                title: 'Low Risk Students Report',
                description: `${low.length} student(s) are in the Low Risk zone (score < 40). These students demonstrate healthy academic and wellness indicators. Maintain current support levels.`,
                rows: low.map(buildRow),
                csvHeaders: ['Name', 'Reg No', 'Department', 'Attendance', 'CGPA', 'Marks', 'Backlogs', 'Stress Level', 'Risk Level', 'Risk Score'],
            },
            {
                id: 4, type: 'Performers', date: today, count: topPerf.length,
                title: 'Top Performers Report',
                description: `Full ranking of all ${topPerf.length} students sorted by CGPA (highest first) then attendance. Identifies academic achievers eligible for recognition, scholarships, or leadership roles.`,
                rows: topPerf.map((s, i) => ({ Rank: `#${i + 1}`, ...buildRow(s) })),
                csvHeaders: ['Rank', 'Name', 'Reg No', 'Department', 'CGPA', 'Attendance', 'Marks', 'Backlogs', 'Risk Level'],
            },
            {
                id: 5, type: 'Backlogs', date: today, count: backlog.length,
                title: 'Backlog Students Report',
                description: `${backlog.length} student(s) have at least 1 pending backlog subject. Total backlogs across all students: ${totalBL}. Sorted by number of backlogs (highest first).`,
                rows: backlog.map(buildRow),
                csvHeaders: ['Name', 'Reg No', 'Department', 'Backlogs', 'CGPA', 'Attendance', 'Risk Level', 'Stress Level'],
            },
            {
                id: 6, type: 'Overall', date: today, count: overall.length,
                title: 'Overall Students Report',
                description: `Complete report of all ${overall.length} students. Dept average attendance: ${avgAtt}%, average CGPA: ${avgCGPA}. High: ${high.length} · Medium: ${medium.length} · Low: ${low.length}.`,
                rows: overall.map((s, i) => ({ Rank: `#${i + 1}`, ...buildRow(s) })),
                csvHeaders: ['Rank', 'Name', 'Reg No', 'Department', 'Attendance', 'CGPA', 'Marks', 'Backlogs', 'Sleep Hours', 'Class Part.', 'Sports Part.', 'Disciplinary', 'Stress Level', 'Risk Level', 'Risk Score'],
            },
        ];
    }, [students]);

    return (
        <FacultyLayout>
            <div className="space-y-8 pb-12">

                {/* ── If detail page is open, show it ── */}
                {detailReport ? (
                    <DetailPage report={detailReport} onBack={() => setDetailReport(null)} />
                ) : (
                    <>
                        <div className="border-b border-slate-100 pb-8">
                            <h1 className="text-6xl font-bold tracking-tighter text-slate-900 leading-none">Institutional Archives</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4 italic leading-relaxed">
                                AUTHORIZED ACCESS ONLY · SELECT PROTOCOL FOR DEEP_VUE ANALYSIS · NODE_COUNT: {students.length}
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-96 gap-4">
                                <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Retrieving Academic Core…</p>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {reports.map(report => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        onView={setDetailReport}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </FacultyLayout>
    );
};

export default Reports;
