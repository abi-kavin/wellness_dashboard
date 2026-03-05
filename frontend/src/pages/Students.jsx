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
            <div className="flex items-center justify-center h-64">
                <div className="h-10 w-10 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
            </div>
        </FacultyLayout>
    );

    return (
        <FacultyLayout>
            <div className="space-y-8 pb-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-800">Student Directory</h1>
                        <p className="text-slate-400 font-medium text-sm mt-0.5">Holistic Overview of Institutional Enrolment</p>
                    </div>
                    <button
                        onClick={() => navigate('/create-student')}
                        className="group relative flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-105 hover:shadow-violet-500/40"
                        style={{ background: 'linear-gradient(to right, #7c3aed, #6366f1)' }}
                    >
                        <span className="transition-transform group-hover:rotate-90"><PlusIcon /></span>
                        Onboard Student
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white/50 p-4 rounded-3xl border border-white/60 backdrop-blur-md shadow-sm">
                    <div className="relative flex-1 min-w-[280px] h-12">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></span>
                        <input
                            type="text"
                            placeholder="Search by name, register number or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-full pl-11 pr-4 bg-white/60 border border-white/70 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30 transition-all"
                        />
                    </div>
                    <div className="flex p-1 bg-white/70 rounded-2xl border border-white/80 shadow-inner gap-1">
                        {['All', 'Low', 'Medium', 'High'].map(level => (
                            <button
                                key={level}
                                onClick={() => setFilterRisk(level)}
                                className={`rounded-xl px-5 py-2 text-xs font-black uppercase tracking-widest transition-all ${filterRisk === level
                                    ? 'text-white shadow-md'
                                    : 'text-slate-400 hover:text-violet-600 hover:bg-white/80'
                                    }`}
                                style={filterRisk === level ? { background: 'linear-gradient(to right, #7c3aed, #6366f1)' } : {}}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                        {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-3xl border border-white/50 bg-white/40 overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-white/50 border-b border-white/60">
                                    {['Student Identity', 'Email', 'Department', 'Attendance', 'Marks', 'Stress', 'Risk', 'Operations'].map(h => (
                                        <th key={h} className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-slate-300 text-sm font-semibold">
                                            No students found. Try adjusting your search or filters.
                                        </td>
                                    </tr>
                                ) : filtered.map(student => (
                                    <tr
                                        key={student._id}
                                        className={`group hover:bg-white/50 transition-all border-b border-white/30 last:border-0 cursor-pointer ${riskBorderColor(student.riskLevel)}`}
                                        onClick={() => navigate(`/students/${student._id}`)}
                                    >
                                        {/* Identity */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg transition-all duration-500 group-hover:text-white flex-shrink-0"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(99,102,241,0.1))',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #6366f1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(99,102,241,0.1))'}
                                                >
                                                    <span style={{ color: 'inherit' }}>{student.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 group-hover:text-violet-600 transition-colors">{student.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.registerNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-medium text-slate-500">{student.email}</span>
                                        </td>
                                        {/* Dept */}
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 rounded-xl bg-white/70 border border-white/80 text-[10px] font-black uppercase tracking-widest text-slate-500">{student.department}</span>
                                        </td>
                                        {/* Attendance */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${student.attendance >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                <span className={`font-bold ${student.attendance >= 75 ? 'text-slate-700' : 'text-red-500'}`}>{student.attendance}%</span>
                                            </div>
                                        </td>
                                        {/* Marks */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-[60px] h-1.5 bg-white/50 rounded-full overflow-hidden border border-white/60">
                                                    <div className="h-full rounded-full" style={{ width: `${student.marks}%`, background: 'linear-gradient(to right, #7c3aed, #6366f1)' }} />
                                                </div>
                                                <span className="text-xs font-black text-violet-600 w-6">{student.marks}</span>
                                            </div>
                                        </td>
                                        {/* Stress */}
                                        <td className="px-6 py-5">
                                            <span className={`text-xs font-bold ${student.stressLevel === 'High' ? 'text-red-500' : student.stressLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-600'}`}>
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
                                                    title="Send Message"
                                                    onClick={() => { setSelectedStudent(student); setIsMessaging(true); }}
                                                    className="p-2.5 rounded-xl bg-white/60 text-slate-400 hover:bg-sky-500 hover:text-white hover:shadow-lg transition-all border border-white/60"
                                                >
                                                    <MessageIcon />
                                                </button>
                                                <button
                                                    title="Edit Parameters"
                                                    onClick={() => navigate(`/edit-student/${student._id}`)}
                                                    className="p-2.5 rounded-xl bg-white/60 text-slate-400 hover:bg-violet-600 hover:text-white hover:shadow-lg transition-all border border-white/60"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    title="Remove Record"
                                                    onClick={(e) => handleDelete(student._id, e)}
                                                    className="p-2.5 rounded-xl bg-white/60 text-slate-400 hover:bg-red-500 hover:text-white hover:shadow-lg transition-all border border-white/60"
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
