import { useState } from 'react';
import { facultyRegister } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const FacultyRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await facultyRegister(formData);
            localStorage.setItem('userInfo', JSON.stringify({ ...response.data, role: 'faculty' }));
            navigate('/faculty-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="card">
                <h2 className="text-2xl font-bold text-center mb-6">Faculty Registration</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Department</label>
                        <select
                            className="input-field"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            required
                        >
                            <option value="">Select Department</option>
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
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full btn-primary py-3">Register</button>
                </form>
                <p className="text-center mt-6 text-slate-600">
                    Already have an account? <Link to="/faculty-login" className="text-blue-600 font-medium hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default FacultyRegister;
