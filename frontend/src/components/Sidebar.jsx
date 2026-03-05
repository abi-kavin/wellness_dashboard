import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

/* ── Inline SVG Icons ── */
const DashboardIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
);
const UsersIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
const BarChartIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);
const FileIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);
const BellIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const SettingsIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
const HeartIcon = () => (
    <svg width="22" height="22" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const navItems = [
    { icon: DashboardIcon, label: 'Dashboard', path: '/faculty-dashboard' },
    { icon: UsersIcon, label: 'Students', path: '/students' },
    { icon: BarChartIcon, label: 'Analytics', path: '/analytics' },
    { icon: FileIcon, label: 'Reports', path: '/reports' },
    { icon: BellIcon, label: 'Alerts', path: '/alerts' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800/60 bg-slate-900/95 backdrop-blur-xl text-white transition-all duration-300">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-violet-500/30"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1, #8b5cf6)' }}>
                    <HeartIcon />
                </div>
                <div>
                    <h1 className="text-base font-black tracking-tight"
                        style={{ background: 'linear-gradient(to right, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Wellness AI
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Risk Analytics</p>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1 px-4 py-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 relative overflow-hidden ${isActive
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-[1.02]'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:scale-[1.01]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`transition-transform duration-300 group-hover:rotate-6 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-400'}`}>
                                    <item.icon />
                                </span>
                                {item.label}
                                {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 rounded-l-full" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom: Settings + Logout */}
            <div className="mt-auto p-4 border-t border-slate-800/60">
                <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-2">
                    {/* User info */}
                    <div className="flex items-center gap-2 px-2">
                        <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-black text-white">
                            {userInfo?.name?.charAt(0) || 'F'}
                        </div>
                        <span className="text-xs font-semibold text-slate-300 truncate max-w-[80px]">{userInfo?.name || 'Faculty'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `p-2 rounded-lg transition-colors ${isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`
                            }
                            title="Settings"
                        >
                            <SettingsIcon />
                        </NavLink>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
