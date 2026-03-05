import { useEffect, useState } from 'react';
import { createStudent, getStudentById, updateStudent } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import FacultyLayout from '../components/FacultyLayout.jsx';

const CreateStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const [formData, setFormData] = useState({
        name: '',
        registerNumber: '',
        department: userInfo?.department || '',
        email: '',
        password: '',
        attendance: '',
        marks: '',
        stressLevel: 'Low'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchStudent();
        }
    }, [id]);

    const fetchStudent = async () => {
        setLoading(true);
        try {
            const { data } = await getStudentById(id);
            setFormData({
                name: data.name,
                registerNumber: data.registerNumber,
                department: data.department,
                email: data.email,
                password: '', // Password shouldn't be revealed
                attendance: data.attendance,
                marks: data.marks,
                stressLevel: data.stressLevel
            });
        } catch (err) {
            setError('Failed to fetch student details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateStudent(id, formData);
            } else {
                await createStudent(formData);
            }
            navigate('/faculty-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    if (loading) return <FacultyLayout><div className="text-center py-12 text-slate-400">Loading...</div></FacultyLayout>;

    return (
        <FacultyLayout>
            <div className="max-w-2xl mx-auto mt-6">
                <div className="card shadow-lg">
                    <h2 className="text-2xl font-bold text-center mb-6">{isEdit ? 'Edit Student' : 'Create Student Profile'}</h2>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Student Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Register Number</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.registerNumber}
                                onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Department</label>
                            <select
                                className="input-field bg-slate-100 cursor-not-allowed"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                                disabled
                            >
                                <option value="">Select Dept</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="IT">IT</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password {isEdit && '(Leave blank to keep current)'}</label>
                            <input
                                type="password"
                                className="input-field"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!isEdit}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Attendance (%)</label>
                            <input
                                type="number"
                                className="input-field"
                                min="0" max="100"
                                value={formData.attendance}
                                onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Marks (%)</label>
                            <input
                                type="number"
                                className="input-field"
                                min="0" max="100"
                                value={formData.marks}
                                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Stress Level</label>
                            <div className="flex gap-4">
                                {['Low', 'Medium', 'High'].map((level) => (
                                    <label key={level} className="flex items-center gap-2 cursor-pointer flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <input
                                            type="radio"
                                            name="stressLevel"
                                            value={level}
                                            checked={formData.stressLevel === level}
                                            onChange={(e) => setFormData({ ...formData, stressLevel: e.target.value })}
                                        />
                                        <span className="text-sm font-medium">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button type="submit" className="w-full btn-primary py-3">
                                {isEdit ? 'Update Student' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </FacultyLayout>
    );
};

export default CreateStudent;
