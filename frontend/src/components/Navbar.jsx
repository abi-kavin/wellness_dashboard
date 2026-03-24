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
        <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 py-6 px-10 sticky top-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            <div className="container mx-auto flex justify-between items-center relative z-10">
                <Link to="/" className="text-3xl font-bold tracking-tight text-slate-900">
                    Wellness<span className="text-blue-600">AI</span>
                </Link>
                <div className="space-x-8 flex items-center">
                    {userInfo ? (
                        <>
                            {userInfo.role === 'student' && (
                                <div
                                    className={`relative cursor-pointer p-3 rounded-2xl transition-all duration-500 backdrop-blur-3xl border ${unreadCount > 0 ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm' : 'text-slate-400 border-slate-100 hover:text-blue-600 hover:bg-slate-50'}`}
                                    onClick={() => navigate('/student-dashboard')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C10.35 2 9 3.35 9 5V5.27C6.18 6.07 4 8.64 4 11.73V17L2 19V20H22V19L20 17V11.73C20 8.64 17.82 6.07 15 5.27V5C15 3.35 13.65 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-white shadow-lg animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            )}
                            <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                SESSION: <span className="text-slate-900">{userInfo.name}</span>
                            </span>
                            <button onClick={logoutHandler} className="px-5 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm">Terminate</button>
                        </>
                    ) : (
                        <>
                            <Link to="/faculty-login" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Access_Faculty</Link>
                            <Link to="/student-login" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Access_Student</Link>
                            <Link to="/faculty-register" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Establish_Node</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

