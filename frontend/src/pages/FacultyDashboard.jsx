import { useEffect, useState } from 'react';
import { getStudents, deleteStudent } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal.jsx';

const FacultyDashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isMessaging, setIsMessaging] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await getStudents();
            setStudents(data);
        } catch (err) {
            setError('Could not load students');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await deleteStudent(id);
                setStudents(students.filter(student => student._id !== id));
            } catch (err) {
                alert('Failed to delete student');
            }
        }
    };

    const openMessaging = (student) => {
        setSelectedStudent(student);
        setIsMessaging(true);
    };

    if (loading) return <div className="text-center mt-10">Loading Students...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
                    <p className="text-slate-500">Manage student profiles and wellness metrics</p>
                </div>
                <Link to="/create-student" className="btn-primary flex items-center gap-2">
                    <span>+</span> Create New Student
                </Link>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.length > 0 ? (
                    students.map((student) => (
                        <div key={student._id} className="card flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold">{student.name}</h3>
                                        <p className="text-sm text-slate-500">{student.registerNumber}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                                                student.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {student.riskLevel} Risk
                                        </span>
                                        <button
                                            onClick={() => openMessaging(student)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors title='Message Student'"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4 text-sm">
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-slate-500">Department</span>
                                        <span className="font-medium">{student.department}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-slate-500">Attendance</span>
                                        <span className="font-medium text-blue-600">{student.attendance}%</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span className="text-slate-500">Marks</span>
                                        <span className="font-medium text-purple-600">{student.marks}/100</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Stress</span>
                                        <span className="font-medium">{student.stressLevel}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={() => navigate(`/edit-student/${student._id}`)}
                                    className="flex-1 btn-secondary text-sm py-1"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(student._id)}
                                    className="flex-1 border border-red-200 text-red-600 px-4 py-1 rounded-lg font-medium hover:bg-red-50 transition-all text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                        No students found. Start by creating a student profile.
                    </div>
                )}
            </div>

            {isMessaging && selectedStudent && (
                <MessageModal
                    student={selectedStudent}
                    onClose={() => {
                        setIsMessaging(false);
                        setSelectedStudent(null);
                    }}
                />
            )}
        </div>
    );
};

export default FacultyDashboard;
