import { useNavigate } from 'react-router-dom';

const HeartIcon = () => (
    <svg width="22" height="22" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const LogOutIcon = () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const StudentLayout = ({ children }) => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div className="min-h-screen relative bg-transparent">
            {/* Using global dark mode background from index.css */}

            {/* Header */}
            <header className="relative z-20 bg-white/80 backdrop-blur-3xl border-b border-slate-200 sticky top-0 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-blue-500/10"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                            <HeartIcon />
                        </div>
                        <div>
                            <h1 className="text-base font-bold tracking-tight text-slate-900">
                                Wellness AI
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Student Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                {userInfo?.name?.charAt(0) || 'S'}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{userInfo?.name || 'Student'}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                            <LogOutIcon />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
