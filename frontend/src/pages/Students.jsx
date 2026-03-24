import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, deleteStudent } from '../services/api';
import MessageModal from '../components/MessageModal.jsx';
import FacultyLayout from '../components/FacultyLayout.jsx';

/* ── Icons ── */
const SearchIcon = ({ size = 18 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const PlusIcon = ({ size = 18 }) => (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const MessageIcon = ({ size = 16 }) => (
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

const RiskBadge = ({ level }) => {
    const styles = {
        High: 'bg-rose-50 text-rose-600 border border-rose-200',
        Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
        Low: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide ${styles[level] || styles.Low}`}>
            {level} Risk
        </span>
    );
};

const Students = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRisk, setFilterRisk] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isMessaging, setIsMessaging] = useState(false);

    useEffect(() => {
        getStudents()
            .then(({ data }) => setStudents(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Permanently remove this student record?')) {
            try {
                await deleteStudent(id);
                setStudents(prev => prev.filter(s => s._id !== id));
            } catch {
                alert('Failed to delete student');
            }
        }
    };

    const filtered = useMemo(() => {
        return students.filter(s => {
            const matchSearch =
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
                s.email.toLowerCase().includes(search.toLowerCase());
            const matchRisk = filterRisk === 'All' || s.riskLevel === filterRisk;
            return matchSearch && matchRisk;
        });
    }, [students, search, filterRisk]);

    const riskBorderColor = (level) => {
        if (level === 'High') return 'border-l-4 border-l-rose-400';
        if (level === 'Medium') return 'border-l-4 border-l-amber-400';
        return '';
    };

    if (loading) return (
        <FacultyLayout>
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse italic">Scanning Directory Records…</p>
            </div>
        </FacultyLayout>
    );

    return (
        <FacultyLayout>
            <div className="space-y-8 pb-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Student <span className="text-blue-600 italic">Core</span></h1>
                        <p className="text-slate-500 font-bold text-sm mt-0.5 italic">Institutional Academic Census & Wellness Telemetry</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-student')}
                        className="group relative flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95 border border-white/20"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                    >
                        <span className="transition-transform group-hover:rotate-90"><PlusIcon /></span>
                        Synchronize Student
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white/70 p-4 rounded-3xl border border-slate-200 backdrop-blur-2xl shadow-xl">
                    <div className="relative flex-1 min-w-[280px] h-12">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></span>
                        <input
                            type="text"
                            placeholder="Identify by identity, index or network address…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-full pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner gap-1">
                        {['All', 'Low', 'Medium', 'High'].map(level => (
                            <button
                                key={level}
                                onClick={() => setFilterRisk(level)}
                                className={`rounded-xl px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${filterRisk === level
                                    ? 'text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                    }`}
                                style={filterRisk === level ? { background: 'linear-gradient(135deg, #2563eb, #4f46e5)' } : {}}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                        {filtered.length} NODES INDEXED
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-3xl border border-slate-200 bg-white/70 overflow-hidden shadow-xl backdrop-blur-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {['Student Identity', 'Email Address', 'Dept', 'Attn', 'Metrics', 'Stress', 'Risk', 'Process'].map(h => (
                                        <th key={h} className="px-6 py-5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-slate-500 text-sm font-semibold">
                                            No students found. Try adjusting your search or filters.
                                        </td>
                                    </tr>
                                ) : filtered.map(student => (
                                    <tr
                                        key={student._id}
                                        className={`group hover:bg-slate-50 transition-all cursor-pointer ${riskBorderColor(student.riskLevel)} border-l-transparent border-l-4 hover:border-l-blue-600`}
                                        onClick={() => navigate(`/students/${student._id}`)}
                                    >
                                        {/* Identity */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-lg transition-all duration-500 overflow-hidden relative group-hover:shadow-lg flex-shrink-0"
                                                    style={{
                                                        background: '#f8fafc',
                                                        border: '1px solid #e2e8f0'
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="relative z-10 text-blue-600 group-hover:text-blue-700 transition-colors">{student.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.registerNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-semibold text-slate-400">{student.email}</span>
                                        </td>
                                        {/* Dept */}
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500">{student.department}</span>
                                        </td>
                                        {/* Attendance */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${student.attendance >= 75 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`} />
                                                <span className={`font-bold ${student.attendance >= 75 ? 'text-slate-700' : 'text-rose-600'}`}>{student.attendance}%</span>
                                            </div>
                                        </td>
                                        {/* Marks */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                    <div className="h-full rounded-full" style={{ width: `${student.marks}%`, background: 'linear-gradient(to right, #7c3aed, #6366f1)' }} />
                                                </div>
                                                <span className="text-xs font-bold text-violet-600 w-6">{student.marks}</span>
                                            </div>
                                        </td>
                                        {/* Stress */}
                                        <td className="px-6 py-5">
                                            <span className={`text-xs font-bold ${student.stressLevel === 'High' ? 'text-rose-600' : student.stressLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {student.stressLevel}
                                            </span>
                                        </td>
                                        {/* Risk */}
                                        <td className="px-6 py-5">
                                            <RiskBadge level={student.riskLevel} />
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                <button
                                                    title="Transmit Message"
                                                    onClick={() => { setSelectedStudent(student); setIsMessaging(true); }}
                                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white border border-slate-200 transition-all shadow-sm"
                                                >
                                                    <MessageIcon />
                                                </button>
                                                <button
                                                    title="Configure Parameters"
                                                    onClick={() => navigate(`/edit-student/${student._id}`)}
                                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-700 hover:text-white border border-slate-200 transition-all shadow-sm"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    title="Purge Record"
                                                    onClick={(e) => handleDelete(student._id, e)}
                                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white border border-slate-200 transition-all shadow-sm"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Message Modal */}
            {isMessaging && selectedStudent && (
                <MessageModal
                    student={selectedStudent}
                    onClose={() => { setIsMessaging(false); setSelectedStudent(null); }}
                />
            )}
        </FacultyLayout>
    );
};

export default Students;
