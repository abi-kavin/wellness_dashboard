import { useEffect, useState } from 'react';
import { getStudentById, getStudentMessages, markMessagesRead } from '../services/api.js';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchProfile();
        fetchMessages();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await getStudentById(userInfo._id);
            setProfile(data);
        } catch (err) {
            console.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const { data } = await getStudentMessages();
            setMessages(data);
            // Mark as read after a short delay
            if (data.some(m => !m.isRead)) {
                setTimeout(async () => {
                    await markMessagesRead();
                }, 3000);
            }
        } catch (err) {
            console.error('Failed to fetch messages');
        }
    };

    const getWellnessScore = (attendance, marks, stress) => {
        let score = (attendance * 0.4) + (marks * 0.5);
        if (stress === 'Low') score += 10;
        else if (stress === 'Medium') score += 5;
        return Math.min(Math.round(score), 100);
    };

    if (loading) return <div className="text-center mt-10">Loading Profile...</div>;
    if (!profile) return <div className="text-center mt-10 text-red-600">Profile not found.</div>;

    const wellnessScore = getWellnessScore(profile.attendance, profile.marks, profile.stressLevel);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">{profile.name}</h1>
                    <p className="text-slate-500 font-medium">{profile.registerNumber} | {profile.department}</p>
                </div>
                <div className="flex items-center gap-4 bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
                    <div className="text-right">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Wellness Score</p>
                        <p className="text-2xl font-black text-blue-700">{wellnessScore}%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-pulse flex items-center justify-center">
                        <span className="text-[10px] font-bold text-blue-600">{wellnessScore}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card text-center">
                    <p className="text-slate-500 text-sm font-medium mb-1">Attendance</p>
                    <p className="text-3xl font-bold text-blue-600">{profile.attendance}%</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${profile.attendance}%` }}></div>
                    </div>
                </div>

                <div className="card text-center">
                    <p className="text-slate-500 text-sm font-medium mb-1">Marks</p>
                    <p className="text-3xl font-bold text-purple-600">{profile.marks}/100</p>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full transition-all duration-1000" style={{ width: `${profile.marks}%` }}></div>
                    </div>
                </div>

                <div className="card text-center">
                    <p className="text-slate-500 text-sm font-medium mb-1">Risk Status</p>
                    <p className={`text-3xl font-bold ${profile.riskLevel === 'High' ? 'text-red-600' :
                        profile.riskLevel === 'Medium' ? 'text-amber-600' :
                            'text-emerald-600'
                        }`}>{profile.riskLevel}</p>
                    <div className="mt-4 flex justify-center gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-2 w-8 rounded-full ${profile.riskLevel === 'High' ? 'bg-red-500' :
                                profile.riskLevel === 'Medium' ? (i <= 2 ? 'bg-amber-500' : 'bg-slate-200') :
                                    (i === 1 ? 'bg-emerald-500' : 'bg-slate-200')
                                }`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card bg-slate-50 border-none">
                <h3 className="font-bold mb-4 text-slate-700">Health & Wellness Insights</h3>
                <ul className="space-y-4">
                    <li className="flex gap-4 items-start">
                        <div className={`mt-1 h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-white ${profile.stressLevel === 'High' ? 'bg-red-400' : 'bg-emerald-400'}`}>
                            {profile.stressLevel === 'High' ? '!' : '✓'}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">Stress Level: {profile.stressLevel}</p>
                            <p className="text-sm text-slate-500">
                                {profile.stressLevel === 'High' ? 'Consider speaking with your advisor or counselor to manage your academic load.' : 'You are managing your stress levels effectively. Keep it up!'}
                            </p>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start border-t pt-4">
                        <div className={`mt-1 h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center text-white ${profile.attendance < 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}>
                            {profile.attendance < 75 ? '!' : '✓'}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">Academic Engagement</p>
                            <p className="text-sm text-slate-500">
                                {profile.attendance < 75 ? 'Your attendance is below 75%. Prioritize attending classes to reduce your risk level.' : 'Great job maintaining consistent attendance!'}
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            {/* Messages Section */}
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Faculty Messages</h3>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                        {messages.length} Total
                    </span>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {messages.length > 0 ? (
                        messages.map((msg) => (
                            <div key={msg._id} className={`p-4 rounded-xl border ${msg.isRead ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">From: Faculty Advisor</p>
                                    <p className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString()}</p>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{msg.message}</p>
                                {!msg.isRead && (
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                        <span className="text-[10px] font-bold text-blue-500 uppercase">New Message</span>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400">No messages from faculty yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
