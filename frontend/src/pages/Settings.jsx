import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../components/FacultyLayout.jsx';

const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/30 last:border-0">
        <div>
            <p className="text-sm font-bold text-slate-800">{label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 ${checked ? 'bg-violet-600' : 'bg-slate-200'}`}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SectionCard = ({ title, icon, badge, children }) => (
    <section className="rounded-[2rem] border border-white/50 bg-white/50 p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    {icon}
                </div>
                <h3 className="font-black text-slate-800 tracking-tight">{title}</h3>
            </div>
            {badge && (
                <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest border border-violet-200">
                    {badge}
                </span>
            )}
        </div>
        {children}
    </section>
);

const Settings = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const pref = (key, def) => {
        try { const v = localStorage.getItem(key); return v === null ? def : v === 'true'; } catch { return def; }
    };

    const [notifications, setNotifications] = useState(() => pref('pref_notifications', true));
    const [emailReminders, setEmailReminders] = useState(() => pref('pref_email_reminders', false));
    const [liveAlerts, setLiveAlerts] = useState(() => pref('rt_live_risk_alerts', true));
    const [autoRefresh, setAutoRefresh] = useState(() => pref('rt_auto_refresh', true));
    const [highRiskAlert, setHighRiskAlert] = useState(() => pref('rt_high_risk_alert', true));
    const [attendanceWatch, setAttWatch] = useState(() => pref('rt_attendance_watch', true));
    const [twoFactor, setTwoFactor] = useState(() => pref('pref_2fa', false));
    const [refreshInterval, setRefreshInterval] = useState(() => { try { return localStorage.getItem('rt_refresh_interval') || '30'; } catch { return '30'; } });

    const save = (key, val) => { try { localStorage.setItem(key, String(val)); } catch { } };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <FacultyLayout>
            <div className="space-y-6 pb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-800">Settings</h1>
                    <p className="text-slate-400 font-medium text-sm mt-0.5">Manage preferences, real-time monitoring, and account</p>
                </div>

                {/* Account Info */}
                <SectionCard title="Account" icon={<span>👤</span>}>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-white/60 mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white text-xl font-black shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
                            {userInfo?.name?.charAt(0) || 'F'}
                        </div>
                        <div>
                            <p className="font-black text-slate-800 text-lg">{userInfo?.name || 'Faculty'}</p>
                            <p className="text-sm text-slate-400">{userInfo?.email || ''}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">{userInfo?.department || 'Faculty'}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold transition-all"
                    >
                        🚪 Logout
                    </button>
                </SectionCard>

                {/* Notifications */}
                <SectionCard title="Notifications" icon={<span>🔔</span>}>
                    <div className="space-y-1">
                        <ToggleRow label="Push Notifications" desc="Receive in-app alerts and banners" checked={notifications} onChange={v => { setNotifications(v); save('pref_notifications', v); }} />
                        <ToggleRow label="Email Reminders" desc="Weekly wellness digest via email" checked={emailReminders} onChange={v => { setEmailReminders(v); save('pref_email_reminders', v); }} />
                    </div>
                </SectionCard>

                {/* Real-Time Monitor */}
                <SectionCard title="Real-Time Monitor" icon={<span>📡</span>} badge="Live">
                    <div className="space-y-1 mb-6">
                        <ToggleRow label="Live Risk Alerts" desc="Show real-time high-risk student flags on dashboard" checked={liveAlerts} onChange={v => { setLiveAlerts(v); save('rt_live_risk_alerts', v); }} />
                        <ToggleRow label="Auto-Refresh Dashboard" desc="Dashboard data refreshes automatically" checked={autoRefresh} onChange={v => { setAutoRefresh(v); save('rt_auto_refresh', v); }} />
                        <ToggleRow label="High Risk Threshold Alert" desc="Alert when a student's risk score exceeds threshold" checked={highRiskAlert} onChange={v => { setHighRiskAlert(v); save('rt_high_risk_alert', v); }} />
                        <ToggleRow label="Attendance Watch" desc="Flag students with attendance below 75%" checked={attendanceWatch} onChange={v => { setAttWatch(v); save('rt_attendance_watch', v); }} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-700">⏱ Refresh Interval</p>
                            <span className="text-sm font-black text-violet-600">{refreshInterval}s</span>
                        </div>
                        <input type="range" min="10" max="120" step="10" value={refreshInterval}
                            onChange={e => { setRefreshInterval(e.target.value); save('rt_refresh_interval', e.target.value); }}
                            className="w-full accent-violet-600" />
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                            <span>10s</span><span>120s</span>
                        </div>
                    </div>
                </SectionCard>

                {/* Privacy */}
                <SectionCard title="Privacy & Security" icon={<span>🔒</span>}>
                    <div className="space-y-1">
                        <ToggleRow label="Two-Factor Authentication" desc="Extra security layer on login" checked={twoFactor} onChange={v => { setTwoFactor(v); save('pref_2fa', v); }} />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button className="flex-1 px-4 py-2.5 rounded-2xl border border-white/60 bg-white hover:bg-slate-50 text-sm font-bold transition-all shadow-sm">Change Password</button>
                        <button className="flex-1 px-4 py-2.5 rounded-2xl border border-white/60 bg-white hover:bg-slate-50 text-sm font-bold transition-all shadow-sm">Active Sessions</button>
                    </div>
                </SectionCard>

                {/* Data */}
                <SectionCard title="Data & Export" icon={<span>💾</span>}>
                    <button
                        onClick={() => alert('Export feature coming soon!')}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-600 text-sm font-black uppercase tracking-widest transition-all"
                    >
                        📥 Export Student Registry (JSON)
                    </button>
                </SectionCard>
            </div>
        </FacultyLayout>
    );
};

export default Settings;
