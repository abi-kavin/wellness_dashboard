import { useEffect, useState } from 'react';
import { getStudentById, getStudentMessages, markMessagesRead } from '../services/api.js';
import StudentLayout from '../components/StudentLayout.jsx';

/* ── Helpers ── */
const pct = (v) => `${Math.round(v)}%`;

const MetricBar = ({ value, max = 100, color }) => (
    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2 border border-slate-200">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
);

const riskColors = {
    High: { card: 'border-rose-200 bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-500', dot: 'bg-rose-500 shadow-sm' },
    Medium: { card: 'border-amber-200 bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500', dot: 'bg-amber-500 shadow-sm' },
    Low: { card: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', dot: 'bg-emerald-500 shadow-sm' },
};
const stressColors = { High: 'text-rose-600', Medium: 'text-amber-600', Low: 'text-emerald-600' };
const stressEmoji = { High: '😰', Medium: '😐', Low: '😌' };
const cpColors = {
    Poor: 'bg-rose-100 text-rose-700 border border-rose-200', Average: 'bg-amber-100 text-amber-700 border border-amber-200',
    Good: 'bg-blue-100 text-blue-700 border border-blue-200', Excellent: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};
const spColors = { None: 'bg-slate-100 text-slate-500 border border-slate-200', Occasional: 'bg-amber-100 text-amber-700 border border-amber-200', Regular: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };

/* ══════════════════════════════════════════════════════
   SMART COMMENTARY GENERATORS
   Mirror the backend cascade so comments align with score
══════════════════════════════════════════════════════ */
const generateAcademicCommentary = (p) => {
    const att = p.attendance ?? 0;
    const cgpa = Number(p.cgpa) || 0;
    const bl = p.backlogs ?? 0;
    const insights = [];

    // Attendance analysis
    if (att < 50) {
        insights.push({ icon: '🚨', color: 'text-red-600', bg: 'bg-red-50 border-red-100', title: 'Critical Attendance', text: `Your attendance is at ${att}% — severely below the 75% minimum. You are at immediate risk of being barred from examinations. Please meet your faculty advisor urgently.` });
    } else if (att < 65) {
        insights.push({ icon: '⚠️', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', title: 'Low Attendance', text: `Attendance stands at ${att}%, which is considerably below the required 75%. Missing further classes may result in academic penalty.` });
    } else if (att < 75) {
        insights.push({ icon: '⚠️', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', title: 'Borderline Attendance', text: `At ${att}%, you are just below the 75% cut-off. Attend every remaining class this semester to avoid shortfall.` });
    } else if (att < 85) {
        insights.push({ icon: '✅', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', title: 'Satisfactory Attendance', text: `Good — your attendance is ${att}%. You are above the threshold, but aim for 85%+ for optimal academic standing.` });
    } else {
        insights.push({ icon: '🌟', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', title: 'Excellent Attendance', text: `Outstanding! At ${att}%, your attendance reflects strong commitment. Keep this consistent through the semester.` });
    }

    // CGPA analysis
    if (cgpa < 4) {
        insights.push({ icon: '🚨', color: 'text-red-600', bg: 'bg-red-50 border-red-100', title: 'Critical CGPA', text: `Your CGPA of ${cgpa}/10 is critically low. This directly drives up your stress and risk levels. Seek academic help immediately and consider remedial programs.` });
    } else if (cgpa < 5) {
        insights.push({ icon: '⚠️', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', title: 'Low CGPA', text: `CGPA of ${cgpa}/10 signals significant academic difficulty. Focus on core subject mastery and seek tutoring support.` });
    } else if (cgpa < 6) {
        insights.push({ icon: '⚠️', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', title: 'Below Average CGPA', text: `A CGPA of ${cgpa}/10 is below average. Improving this will significantly lower your overall risk score.` });
    } else if (cgpa < 7) {
        insights.push({ icon: '📘', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', title: 'Average CGPA', text: `Your CGPA of ${cgpa}/10 is at an acceptable level. Targeting 7.0+ in the next semester will move you into good standing.` });
    } else if (cgpa < 8.5) {
        insights.push({ icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', title: 'Good CGPA', text: `Solid CGPA of ${cgpa}/10. You're performing well academically. Push towards 9.0 for distinction honours.` });
    } else {
        insights.push({ icon: '🏆', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100', title: 'Excellent CGPA', text: `Exceptional CGPA of ${cgpa}/10! You are in the top academic tier. Consider applying for research opportunities or scholarships.` });
    }

    // Backlogs analysis
    if (bl >= 5) {
        insights.push({ icon: '🚨', color: 'text-red-600', bg: 'bg-red-50 border-red-100', title: `${bl} Active Backlogs`, text: `You have ${bl} pending backlogs — a major contributor to your current risk score. Create a subject-wise study schedule and prioritize clearing them before supplementary exams.` });
    } else if (bl >= 3) {
        insights.push({ icon: '⚠️', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', title: `${bl} Backlogs Detected`, text: `${bl} backlogs are adding significant pressure. Focus on 1–2 subjects at a time and allocate dedicated revision time each week.` });
    } else if (bl >= 1) {
        insights.push({ icon: '📝', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', title: `${bl} Backlog(s) Pending`, text: `You have ${bl} backlog subject(s). Clear them soon to reduce your academic risk profile and improve your CGPA.` });
    } else {
        insights.push({ icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', title: 'No Backlogs', text: 'Clean record — no pending backlogs. Well done! Continue working consistently to maintain this status.' });
    }

    return insights;
};

const generateEngagementCommentary = (p) => {
    const cp = p.classParticipation || 'Average';
    const sp = p.sportsParticipation || 'None';
    const comp = p.competitionParticipation || 'None';
    const insights = [];

    // Class participation
    const cpMap = {
        Poor: { icon: '😶', color: 'text-red-600', bg: 'bg-red-50 border-red-100', text: 'Your class participation is rated Poor. Active in-class engagement boosts understanding and lowers stress. Try asking at least one question per lecture.' },
        Average: { icon: '🙂', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', text: 'Your participation is Average. Stepping up your in-class engagement will benefit your learning outcomes and how faculty perceive your dedication.' },
        Good: { icon: '👍', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', text: 'Good class participation! You are actively engaged in lectures. Keep it up and consider taking on discussion-leading roles.' },
        Excellent: { icon: '⭐', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', text: 'Excellent class participation! You are one of the most engaged students. This positively impacts your risk profile and faculty perception.' },
    };
    const cpInfo = cpMap[cp] || cpMap.Average;
    insights.push({ icon: cpInfo.icon, color: cpInfo.color, bg: cpInfo.bg, title: `Class Participation: ${cp}`, text: cpInfo.text });

    // Sports participation
    if (sp === 'None') {
        insights.push({ icon: '🏃', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', title: 'No Sports Activity', text: 'You are not currently participating in sports. Physical activity is proven to reduce stress by up to 30%. Even a 30-minute walk daily can improve focus and wellbeing.' });
    } else if (sp === 'Occasional') {
        insights.push({ icon: '⚽', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', title: 'Occasional Sports', text: 'Good that you engage in sports occasionally! Increasing this to regular participation will further reduce stress levels and improve your overall wellness score.' });
    } else {
        insights.push({ icon: '🏅', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', title: 'Regular Sports', text: 'Excellent! Regular sports participation is a key stress buffer. Your physical engagement is contributing positively to your mental wellness and risk score.' });
    }

    // Competition participation
    if (comp === 'None') {
        insights.push({ icon: '💡', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100', title: 'No Competition Activity', text: 'You have not participated in any competitions. Hackathons, quizzes, and technical fests build real-world skills, improve confidence, and are viewed positively by faculty.' });
    } else if (comp === 'Occasional') {
        insights.push({ icon: '🎯', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', title: 'Occasional Competitions', text: 'You occasionally take part in competitions. Try to increase this to regular participation — it demonstrates initiative and reduces your engagement risk score.' });
    } else {
        insights.push({ icon: '🏆', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', title: 'Active Competitor', text: 'You regularly participate in competitions — that\'s impressive! This reflects strong motivation and extracurricular commitment, positively influencing your overall assessment.' });
    }

    return insights;
};

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => { fetchProfile(); fetchMessages(); }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await getStudentById(userInfo._id);
            setProfile(data);
        } catch { console.error('Failed to load profile'); }
        finally { setLoading(false); }
    };

    const fetchMessages = async () => {
        try {
            const { data } = await getStudentMessages();
            setMessages(data);
            if (data.some(m => !m.isRead)) {
                setTimeout(async () => { await markMessagesRead(); }, 3000);
            }
        } catch { console.error('Failed to fetch messages'); }
    };

    if (loading) return (
        <StudentLayout>
            <div className="flex flex-col items-center gap-3 mt-20">
                <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                <p className="text-sm font-bold text-slate-400 tracking-widest uppercase italic">Syncing Performance Data…</p>
            </div>
        </StudentLayout>
    );

    if (!profile) return (
        <StudentLayout>
            <div className="text-center mt-20 text-rose-600 font-bold bg-rose-50 p-6 rounded-2xl border border-rose-200">
                Profile records not found.
            </div>
        </StudentLayout>
    );

    const risk = riskColors[profile.riskLevel] || riskColors.Low;
    const riskScore = profile.riskScore ?? 0;
    const academicInsights = generateAcademicCommentary(profile);
    const engagementInsights = generateEngagementCommentary(profile);

    return (
        <StudentLayout>
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Header ── */}
                <div className="bg-white/70 p-8 rounded-[2.5rem] shadow-xl border border-slate-200 backdrop-blur-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">Student: {profile.name}</h1>
                        <p className="text-slate-500 font-bold mt-2">{profile.registerNumber} · <span className="text-blue-600 uppercase tracking-widest text-xs">{profile.department} UNIT</span></p>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">{profile.email}</p>
                    </div>
                    <div className={`flex items-center gap-5 px-6 py-4 rounded-2xl border shadow-sm ${risk.card}`}>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${risk.text}`}>Risk Category</p>
                            <p className={`text-3xl font-bold ${risk.text}`}>{profile.riskLevel}</p>
                            <p className={`text-xs font-bold ${risk.text} opacity-70`}>Metric: {riskScore}/100</p>
                        </div>
                        <div className="w-16 h-16 flex-shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3.5" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3.5"
                                    strokeDasharray={`${riskScore} ${100 - riskScore}`}
                                    strokeLinecap="round" className={risk.text} />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ── Stress + Wellness overview ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Stress State', value: `${stressEmoji[profile.stressLevel]} ${profile.stressLevel}`, colorClass: stressColors[profile.stressLevel] },
                        { label: 'Sleep Quality', value: `🌙 ${profile.sleepHours ?? '—'} hrs`, colorClass: (profile.sleepHours >= 7 && profile.sleepHours <= 9) ? 'text-emerald-600' : 'text-amber-600' },
                        { label: 'Disciplinary', value: (profile.disciplinaryIssues ?? 0) === 0 ? '✓ None' : `⚠ ${profile.disciplinaryIssues}`, colorClass: (profile.disciplinaryIssues ?? 0) === 0 ? 'text-emerald-600' : 'text-rose-600' },
                        { label: 'Marks Mean', value: `${profile.marks ?? '—'}/100`, colorClass: (profile.marks ?? 0) >= 50 ? 'text-blue-600' : 'text-rose-600' },
                    ].map(item => (
                        <div key={item.label} className="bg-white/70 rounded-2xl border border-slate-200 p-4 shadow-sm backdrop-blur-3xl text-center group hover:bg-white transition-all">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                            <p className={`text-lg font-bold mt-1 ${item.colorClass} group-hover:scale-105 transition-transform`}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Academic Metrics ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-white/70 rounded-2xl border border-slate-200 p-5 shadow-sm backdrop-blur-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Attendance Quotient</p>
                        <p className="text-4xl font-bold text-blue-600 mt-1">{pct(profile.attendance)}</p>
                        <MetricBar value={profile.attendance} color="bg-blue-600" />
                        <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${profile.attendance < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {profile.attendance < 75 ? '⚠ CRITICAL SHORTFALL' : '✓ TARGET ACHIEVED'}
                        </p>
                    </div>
                    <div className="bg-white/70 rounded-2xl border border-slate-200 p-5 shadow-sm backdrop-blur-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Academic Index</p>
                        <p className="text-4xl font-bold text-blue-600 mt-1">{profile.cgpa ?? '—'}<span className="text-lg text-slate-300">/10</span></p>
                        <MetricBar value={(profile.cgpa ?? 0) * 10} color="bg-indigo-600" />
                        <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${(profile.cgpa ?? 0) < 6 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {(profile.cgpa ?? 0) < 6 ? '⚠ PERFORMANCE GAP' : '✓ STABLE STANDING'}
                        </p>
                    </div>
                    <div className="bg-white/70 rounded-2xl border border-slate-200 p-5 shadow-sm backdrop-blur-3xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Backlog Inventory</p>
                        <p className={`text-4xl font-bold mt-1 ${(profile.backlogs ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {profile.backlogs ?? 0}
                        </p>
                        <div className="mt-3 flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-2.5 flex-1 rounded-full ${i <= (profile.backlogs ?? 0) ? 'bg-rose-500' : 'bg-slate-100'}`} />
                            ))}
                        </div>
                        <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${(profile.backlogs ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {(profile.backlogs ?? 0) === 0 ? '✓ CLEAR RECORD' : `${profile.backlogs} SUBJECTS PENDING`}
                        </p>
                    </div>
                </div>

                {/* ── Academic Insights ── */}
                <div className="rounded-[2.5rem] border border-blue-200 bg-blue-50/50 p-8 shadow-sm backdrop-blur-3xl space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-lg shadow-lg">📈</div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600">Learning Performance Analysis</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional telemetry feed</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {academicInsights.map((item, i) => (
                            <div key={i} className={`flex items-start gap-4 rounded-2xl border p-5 bg-white transition-all shadow-sm border-slate-100 hover:border-blue-300`}>
                                <span className="text-2xl flex-shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-100">{item.icon}</span>
                                <div className="mt-1">
                                    <p className={`text-base font-bold ${item.color} tracking-tight`}>{item.title}</p>
                                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Engagement Indicators ── */}
                <div className="bg-white/70 rounded-[2.5rem] border border-slate-200 p-8 shadow-sm backdrop-blur-3xl space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity Telemetry</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">In-Class Velocity</span>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${cpColors[profile.classParticipation]}`}>{profile.classParticipation || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Physical Engagement</span>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${spColors[profile.sportsParticipation]}`}>{profile.sportsParticipation || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Extracurricular</span>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${spColors[profile.competitionParticipation]}`}>{profile.competitionParticipation || '—'}</span>
                        </div>
                    </div>
                </div>

                {/* ── Engagement Analytics ── */}
                <div className="rounded-[2.5rem] border border-emerald-200 bg-emerald-50/50 p-8 shadow-sm backdrop-blur-3xl space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-lg shadow-lg">🌱</div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600">Student Life Insights</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Holistic life-cycle variance</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {engagementInsights.map((item, i) => (
                            <div key={i} className={`flex items-start gap-4 rounded-2xl border p-5 bg-white border-slate-100 hover:border-emerald-300 transition-all shadow-sm`}>
                                <span className="text-2xl flex-shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-100">{item.icon}</span>
                                <div className="mt-1">
                                    <p className={`text-base font-bold ${item.color} tracking-tight`}>{item.title}</p>
                                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Faculty Remarks ── */}
                {profile.facultyRemarks && (
                    <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-6 relative z-10 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                            Official Faculty Recommendation
                        </h3>
                        <p className="text-slate-100 leading-relaxed italic relative z-10 text-xl font-medium tracking-tight">"{profile.facultyRemarks}"</p>
                    </div>
                )}

                {/* ── Directives Section ── */}
                <div className="bg-white/70 rounded-[2.5rem] border border-slate-200 p-8 shadow-xl backdrop-blur-3xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Directives</h3>
                        <span className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">{messages.length} ARCHIVED</span>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {messages.length > 0 ? messages.map((msg) => (
                            <div key={msg._id} className={`p-6 rounded-2xl border transition-all ${msg.isRead ? 'bg-slate-50 border-slate-100' : 'bg-blue-50 border-blue-200 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic">Transmission Segment</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium text-base italic">"{msg.message}"</p>
                                {!msg.isRead && (
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse shadow-sm" />
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">New Priority directive</span>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Communication channel idle</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;
