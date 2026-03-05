import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUnreadCount } from '../services/api.js';

// Routes that use the new Sidebar OR are auth-only — Navbar should be hidden there
const SIDEBAR_ROUTES = [
    '/login', '/register',
    '/faculty-login', '/faculty-register', '/student-login',
    '/faculty-dashboard', '/students', '/analytics',
    '/reports', '/alerts', '/settings',
    '/create-student',
];

const Navbar = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [unreadCount, setUnreadCount] = useState(0);

    // Hide on faculty sidebar pages or edit-student routes
    const isSidebarPage = SIDEBAR_ROUTES.includes(pathname)
        || pathname.startsWith('/edit-student')
        || pathname.startsWith('/students');
    if (isSidebarPage) return null;

    useEffect(() => {
        if (userInfo && userInfo.role === 'student') {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error('Failed to fetch unread count');
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md py-4 px-6 mb-8">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    WellnessRisk
                </Link>
                <div className="space-x-4 flex items-center">
                    {userInfo ? (
                        <>
                            {userInfo.role === 'student' && (
                                <div
                                    className={`relative mr-4 cursor-pointer p-2 rounded-full transition-all ${unreadCount > 0 ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-100'}`}
                                    onClick={() => navigate('/student-dashboard')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C10.35 2 9 3.35 9 5V5.27C6.18 6.07 4 8.64 4 11.73V17L2 19V20H22V19L20 17V11.73C20 8.64 17.82 6.07 15 5.27V5C15 3.35 13.65 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            )}
                            <span className="hidden md:inline text-slate-600 mr-2">Hello, {userInfo.name}</span>
                            <button onClick={logoutHandler} className="btn-secondary">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/faculty-login" className="text-slate-600 hover:text-blue-600 font-medium transition">Faculty</Link>
                            <Link to="/student-login" className="text-slate-600 hover:text-blue-600 font-medium transition">Student</Link>
                            <Link to="/faculty-register" className="btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

