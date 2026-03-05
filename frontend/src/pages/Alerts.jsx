import FacultyLayout from '../components/FacultyLayout.jsx';

const alerts = [
    { id: 1, type: 'high', message: "A student's marks dropped below 40. Immediate counseling recommended.", time: '2 hours ago' },
    { id: 2, type: 'high', message: 'Low attendance detected for multiple students. Follow-up needed.', time: '5 hours ago' },
    { id: 3, type: 'medium', message: 'Several students reported high stress levels in latest assessment.', time: '1 day ago' },
    { id: 4, type: 'info', message: 'Monthly wellness report for January has been generated.', time: '2 days ago' },
    { id: 5, type: 'success', message: "A student's wellness improved significantly this month.", time: '3 days ago' },
    { id: 6, type: 'medium', message: 'Department average wellness score dropped below threshold.', time: '3 days ago' },
];

const typeConfig = {
    high: { label: 'High Priority', icon: '⚠️', border: 'border-red-200/60', bg: 'bg-red-50/60', iconBg: 'from-red-500 to-orange-500', text: 'text-red-600', pulse: true },
    medium: { label: 'Medium Priority', icon: 'ℹ️', border: 'border-amber-200/60', bg: 'bg-amber-50/60', iconBg: 'from-amber-400 to-orange-400', text: 'text-amber-600', pulse: false },
    info: { label: 'Info', icon: '📋', border: 'border-white/50', bg: 'bg-white/40', iconBg: 'from-blue-400 to-indigo-400', text: 'text-blue-600', pulse: false },
    success: { label: 'Resolved', icon: '✅', border: 'border-emerald-200/60', bg: 'bg-emerald-50/60', iconBg: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', pulse: false },
};

const Alerts = () => (
    <FacultyLayout>
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-800">Institutional Alerts</h1>
                    <p className="text-slate-400 font-medium text-sm mt-0.5">Real-time Wellness Monitoring & Notifications</p>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/50 px-4 py-2.5 backdrop-blur border border-white/60 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live · Last refresh: 2m ago</span>
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map(alert => {
                    const cfg = typeConfig[alert.type];
                    return (
                        <div
                            key={alert.id}
                            className={`group flex items-start gap-6 rounded-[2rem] border ${cfg.border} ${cfg.bg} p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                        >
                            <div className={`mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.iconBg} shadow-inner text-2xl transition-transform duration-500 group-hover:rotate-12`}>
                                {cfg.icon}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${cfg.text}`}>{cfg.label}</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.time}</p>
                                </div>
                                <p className="text-base font-bold text-slate-800 leading-relaxed">{alert.message}</p>
                                <div className="pt-2 flex items-center gap-4">
                                    <button className={`text-[10px] font-black uppercase tracking-widest ${cfg.text} opacity-70 hover:opacity-100 transition-opacity`}>Acknowledge</button>
                                    <div className="h-1 w-1 rounded-full bg-slate-200" />
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">Details</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </FacultyLayout>
);

export default Alerts;
