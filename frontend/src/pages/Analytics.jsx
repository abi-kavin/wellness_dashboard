import FacultyLayout from '../components/FacultyLayout.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { getStudents } from '../services/api';

const stressFactors = [
    { factor: 'Academics', value: 85 },
    { factor: 'Sleep', value: 60 },
    { factor: 'Social', value: 45 },
    { factor: 'Exercise', value: 55 },
    { factor: 'Finance', value: 70 },
    { factor: 'Mental Health', value: 75 },
];

const monthlyTrend = [
    { month: 'Aug', high: 12, medium: 18, low: 30 },
    { month: 'Sep', high: 15, medium: 20, low: 28 },
    { month: 'Oct', high: 10, medium: 22, low: 35 },
    { month: 'Nov', high: 18, medium: 15, low: 25 },
    { month: 'Dec', high: 20, medium: 12, low: 22 },
    { month: 'Jan', high: 14, medium: 18, low: 32 },
];

const Analytics = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        getStudents().then(({ data }) => setStudents(data)).catch(() => { });
    }, []);

    const sorted = useMemo(() =>
        [...students].sort((a, b) => b.marks - a.marks || b.attendance - a.attendance),
        [students]);

    const highCount = students.filter(s => s.riskLevel === 'High').length;
    const medCount = students.filter(s => s.riskLevel === 'Medium').length;
    const lowCount = students.filter(s => s.riskLevel === 'Low').length;

    const deptData = useMemo(() => {
        const map = {};
        students.forEach(s => {
            if (!map[s.department]) map[s.department] = { dept: s.department, total: 0, markSum: 0 };
            map[s.department].total++;
            map[s.department].markSum += s.marks;
        });
        return Object.values(map).map(d => ({ department: d.dept, score: Math.round(d.markSum / d.total) }));
    }, [students]);

    const computeRisk = (s) => {
        const markDef = Math.max(0, (100 - s.marks) / 100);
        const attDef = Math.max(0, (100 - s.attendance) / 100);
        return Math.round((markDef * 0.6 + attDef * 0.4) * 100);
    };

    return (
        <FacultyLayout>
            <div className="space-y-8 pb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-800">Analytics</h1>
                    <p className="text-slate-400 font-medium text-sm mt-0.5">Deep Dive into Institutional Wellness</p>
                </div>

                {/* Dept bar chart */}
                {deptData.length > 0 && (
                    <div className="rounded-3xl border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-md">
                        <h3 className="mb-6 text-xl font-black text-slate-800 uppercase tracking-tight">Departmental Avg Marks</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={deptData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }} />
                                <Bar dataKey="score" name="Avg Marks" fill="#7c3aed" radius={[8, 8, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Stress Radar */}
                    <div className="rounded-3xl border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-md">
                        <h3 className="mb-6 text-xl font-black text-slate-800 uppercase tracking-tight">Stress Factors</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={stressFactors} cx="50%" cy="50%" outerRadius="72%">
                                <PolarGrid stroke="rgba(0,0,0,0.05)" />
                                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                <Radar dataKey="value" stroke="#7c3aed" strokeWidth={3} fill="#7c3aed" fillOpacity={0.15} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Risk Velocity line */}
                    <div className="rounded-3xl border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Risk Velocity</h3>
                            <div className="flex gap-4 text-[10px] font-black uppercase">
                                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />High</span>
                                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />Low</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '1.2rem', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }} />
                                <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={4} dot={{ r: 6 }} />
                                <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={4} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Top Performers */}
                    <div className="rounded-3xl border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-md">
                        <h3 className="mb-6 text-xl font-black text-slate-800 uppercase tracking-tight">Top Performers</h3>
                        <div className="space-y-3">
                            {sorted.slice(0, 5).map((s, i) => (
                                <div key={s._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60 transition-all hover:bg-white/60 hover:translate-x-1">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black shadow-lg text-sm ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-white text-slate-400'
                                            }`}>{i + 1}</div>
                                        <div>
                                            <div className="font-black text-slate-800 leading-none mb-1">{s.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">{s.department}</div>
                                        </div>
                                    </div>
                                    <div className="text-right font-black text-violet-600">{s.marks}/100</div>
                                </div>
                            ))}
                            {sorted.length === 0 && <p className="text-slate-300 text-sm text-center py-8">No students yet</p>}
                        </div>
                    </div>

                    {/* Risk Clusters */}
                    <div className="rounded-3xl border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-md">
                        <h3 className="mb-6 text-xl font-black text-slate-800 uppercase tracking-tight">Risk Clusters</h3>
                        <div className="space-y-5">
                            {[
                                { label: 'Critical', count: highCount, color: 'text-red-500', bg: 'bg-red-50', data: students.filter(s => s.riskLevel === 'High') },
                                { label: 'Monitoring', count: medCount, color: 'text-amber-500', bg: 'bg-amber-50', data: students.filter(s => s.riskLevel === 'Medium') },
                                { label: 'Healthy', count: lowCount, color: 'text-emerald-600', bg: 'bg-emerald-50', data: students.filter(s => s.riskLevel === 'Low') },
                            ].map(cluster => (
                                <div key={cluster.label} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                                        <p className={cluster.color}>{cluster.label}</p>
                                        <span className={`px-2 py-0.5 rounded-md ${cluster.bg} ${cluster.color}`}>{cluster.count}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cluster.data.slice(0, 4).map(s => (
                                            <div key={s._id} className={`px-3 py-2 rounded-xl text-[11px] font-bold border ${cluster.color} bg-white/40 border-white/50`}>{s.name}</div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Full Ledger */}
                {sorted.length > 0 && (
                    <div className="rounded-3xl border border-white/50 bg-white/40 p-8 shadow-xl backdrop-blur-md overflow-hidden">
                        <h3 className="mb-6 text-xl font-black text-slate-800 uppercase tracking-tight">Full Academic Ledger</h3>
                        <div className="overflow-x-auto rounded-2xl border border-white/50 bg-white/20">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/40 border-b border-white/60">
                                        {['Rank', 'Student', 'Risk Velocity'].map(h => (
                                            <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.slice(0, 10).map((s, i) => {
                                        const riskPct = computeRisk(s);
                                        return (
                                            <tr key={s._id} className="hover:bg-white/40 border-b border-white/30 last:border-0 transition-colors">
                                                <td className="px-6 py-4 font-black text-slate-400">#{i + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-600">{s.name.charAt(0)}</div>
                                                        <div>
                                                            <div className="font-black text-slate-800">{s.name}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase">{s.department}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-48 flex items-center gap-3">
                                                        <div className="flex-1 h-3 bg-white/50 rounded-full overflow-hidden border border-white/60">
                                                            <div
                                                                className={`h-full rounded-full ${riskPct > 70 ? 'bg-red-500' : riskPct > 30 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                                style={{ width: `${riskPct}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs font-black text-slate-600">{riskPct}%</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
};

export default Analytics;
