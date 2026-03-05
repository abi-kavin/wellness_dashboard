import { useState } from 'react';
import { facultyLogin } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const FacultyLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await facultyLogin(formData);
            localStorage.setItem('userInfo', JSON.stringify({ ...data, role: 'faculty' }));
            navigate('/faculty-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="card">
                <h2 className="text-2xl font-bold text-center mb-6">Faculty Login</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <button type="submit" className="w-full btn-primary py-3">Login</button>
                </form>
                <p className="text-center mt-6 text-slate-600">
                    Don't have an account? <Link to="/faculty-register" className="text-blue-600 font-medium hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default FacultyLogin;
