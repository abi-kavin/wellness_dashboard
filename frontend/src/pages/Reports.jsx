import FacultyLayout from '../components/FacultyLayout.jsx';

const reports = [
    { id: 1, title: 'Monthly Wellness Report – January 2026', date: '2026-02-01', type: 'Monthly', description: 'Overview of student mental health and academic engagement trends for the month of January.' },
    { id: 2, title: 'Department-wise Risk Analysis', date: '2026-01-28', type: 'Department', description: 'Detailed breakdown of risk distribution and wellness metrics for your department.' },
    { id: 3, title: 'High Risk Students Report – Semester 4', date: '2026-01-25', type: 'Risk', description: 'Critical action list identifying students who require immediate intervention based on high stress and low attendance.' },
    { id: 4, title: 'Monthly Wellness Report – December 2025', date: '2026-01-01', type: 'Monthly', description: 'Historical record of wellness scores and engagement levels during the end-of-year examination period.' },
    { id: 5, title: 'Annual Wellness Summary 2025', date: '2025-12-31', type: 'Annual', description: 'A comprehensive yearly overview of the institution\'s overall wellness index and long-term trends in student risk management.' },
];

const typeColors = {
    Monthly: 'text-blue-600 bg-blue-50 border-blue-200',
    Department: 'text-violet-600 bg-violet-50 border-violet-200',
    Risk: 'text-red-600 bg-red-50 border-red-200',
    Annual: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

const FileIcon = () => (
    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-violet-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);
const DownloadIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const Reports = () => (
    <FacultyLayout>
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-800">Institutional Reports</h1>
                <p className="text-slate-400 font-medium text-sm mt-0.5">Strategic Analysis & Historical Dossiers</p>
            </div>

            <div className="grid gap-6">
                {reports.map(report => (
                    <div
                        key={report.id}
                        className="group flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2.5rem] border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-md transition-all hover:bg-white/60 hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="flex items-start gap-6 flex-1">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 shadow-inner transition-transform group-hover:scale-110 duration-500">
                                <FileIcon />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${typeColors[report.type] || typeColors.Monthly}`}>
                                        {report.type}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 group-hover:text-violet-600 transition-colors leading-tight">
                                    {report.title}
                                </h3>
                                <p className="text-slate-500 font-medium max-w-2xl leading-relaxed text-sm">
                                    {report.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            <button
                                onClick={() => alert('PDF export coming soon!')}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl h-11 px-6 border border-white/70 bg-white/50 text-sm font-black uppercase tracking-widest text-slate-600 hover:bg-white transition-all shadow-sm"
                            >
                                <DownloadIcon /> Download
                            </button>
                            <button
                                onClick={() => alert('Report detail view coming soon!')}
                                className="w-full sm:w-auto rounded-2xl h-11 px-7 text-white text-sm font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(to right, #7c3aed, #6366f1)' }}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </FacultyLayout>
);

export default Reports;
