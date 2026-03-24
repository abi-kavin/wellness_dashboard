import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../components/FacultyLayout.jsx';

const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0 group">
        <div className="flex-1">
            <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-widest">{label}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{desc}</p>
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-7 w-14 shrink-0 rounded-full border border-slate-200 transition-all duration-300 ${checked ? 'bg-blue-600 border-blue-600' : 'bg-slate-100'}`}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 absolute top-0.5 left-0.5 ${checked ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SectionCard = ({ title, icon, badge, children }) => (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white/70 p-8 shadow-sm backdrop-blur-3xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-lg">{icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
            </div>
            {badge && (
                <span className="px-4 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                    {badge}
                </span>
            )}
        </div>
        <div className="relative z-10">
            {children}
        </div>
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
            <div className="space-y-8 pb-20">
                <div className="border-b border-slate-200 pb-8">
                    <h1 className="text-5xl font-bold tracking-tight text-slate-900">Settings</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Personalization · Node Preferences · Security Protocols</p>
                </div>

                <SectionCard title="Administrator Profile" icon="👤">
                    <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 mb-6 relative overflow-hidden">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-white text-3xl font-bold shadow-xl relative z-10"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                            {userInfo?.name?.charAt(0) || 'F'}
                        </div>
                        <div className="relative z-10">
                            <p className="text-3xl font-bold text-slate-900 tracking-tight">{userInfo?.name || 'Faculty Node'}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{userInfo?.email || 'OFFLINE@SYSTEM'}</p>
                            <span className="inline-block mt-3 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100">
                                Sector: {userInfo?.department || 'System Architecture'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                        🚪 Terminate Terminal Session
                    </button>
                </SectionCard>

                <SectionCard title="Visual Telemetry" icon="🔔">
                    <div className="space-y-4">
                        <ToggleRow label="Interface Notifications" desc="Real-time UI alerts and HUD notifications" checked={notifications} onChange={v => { setNotifications(v); save('pref_notifications', v); }} />
                        <ToggleRow label="Email Dispatches" desc="Priority wellness digests via institutional mail" checked={emailReminders} onChange={v => { setEmailReminders(v); save('pref_email_reminders', v); }} />
                    </div>
                </SectionCard>

                {/* Real-Time Monitor */}
                <SectionCard title="Deep_Vue Monitor" icon="📡" badge="Streaming">
                    <div className="space-y-4 mb-8">
                        <ToggleRow label="Active Risk Tracking" desc="Show real-time high-risk node flags on primary dashboard" checked={liveAlerts} onChange={v => { setLiveAlerts(v); save('rt_live_risk_alerts', v); }} />
                        <ToggleRow label="System Auto-Sync" desc="Synchronize main visual display with core database" checked={autoRefresh} onChange={v => { setAutoRefresh(v); save('rt_auto_refresh', v); }} />
                        <ToggleRow label="High Magnitude Pulse" desc="Alert when a node's risk magnitude exceeds safety thresholds" checked={highRiskAlert} onChange={v => { setHighRiskAlert(v); save('rt_high_risk_alert', v); }} />
                        <ToggleRow label="Attendance Protocol" desc="Flag nodes with attendance below critical 75% zone" checked={attendanceWatch} onChange={v => { setAttWatch(v); save('rt_attendance_watch', v); }} />
                    </div>
                    <div className="space-y-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">⏱ Sync_Frequency</p>
                            <span className="text-base font-bold text-blue-600 tabular-nums">{refreshInterval}s</span>
                        </div>
                        <div className="relative h-2 flex items-center">
                            <div className="absolute inset-0 bg-slate-200 rounded-full" />
                            <input type="range" min="10" max="120" step="10" value={refreshInterval}
                                onChange={e => { setRefreshInterval(e.target.value); save('rt_refresh_interval', e.target.value); }}
                                className="w-full relative z-10 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-md" />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-300 font-bold uppercase tracking-widest">
                            <span>10s</span><span>120s</span>
                        </div>
                    </div>
                </SectionCard>

                {/* Privacy */}
                <SectionCard title="Vault_Security" icon="🔒">
                    <div className="space-y-4">
                        <ToggleRow label="Multi-Factor Auth" desc="Dual-layer security matrix for login verification" checked={twoFactor} onChange={v => { setTwoFactor(v); save('pref_2fa', v); }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <button className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all shadow-sm">Rotate Access Keys</button>
                        <button className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all shadow-sm">Active Sessions</button>
                    </div>
                </SectionCard>

                {/* Data */}
                <SectionCard title="Export Registry" icon="💾">
                    <button
                        onClick={() => alert('Exporting encrypted registry core…')}
                        className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                        📥 Download Student Core (JSON)
                    </button>
                </SectionCard>
            </div>
        </FacultyLayout>
    );
};

export default Settings;
