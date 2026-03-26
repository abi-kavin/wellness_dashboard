import { useState, useEffect } from 'react';
import { getStudents } from '../services/api';

const AiInsights = () => {
    const [insights, setInsights] = useState([]);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStudents()
            .then(({ data }) => {
                if (!data || data.length === 0) {
                    setSummary("Platform health is stable. Insufficient data for analytics.");
                    setInsights([]);
                    return;
                }
                const highRisk = data.filter(s => s.riskLevel === 'High').length;
                const lowAtt = data.filter(s => (s.attendance || 100) < 75).length;
                const highStress = data.filter(s => s.stressLevel === 'High').length;

                setSummary("Platform wellness metrics indicate normal operational status.");
                setInsights([
                    `${highRisk} student${highRisk !== 1 ? 's' : ''} currently flagged in the High Risk cluster.`,
                    `${lowAtt} student${lowAtt !== 1 ? 's are' : ' is'} tracking below the 75% attendance threshold.`,
                    `${highStress} student${highStress !== 1 ? 's' : ''} reported elevated or critical stress levels.`
                ]);
            })
            .catch(err => {
                console.error("Insight Error:", err);
                setSummary("Unable to load smart indications at this time.");
                setInsights([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="rounded-[2.5rem] border border-slate-200 bg-white/70 p-8 shadow-xl backdrop-blur-3xl relative overflow-hidden animate-pulse">
            <div className="h-4 w-1/3 bg-slate-100 rounded-full mb-6" />
            <div className="space-y-4">
                <div className="h-3 w-full bg-slate-50 rounded-full" />
                <div className="h-3 w-5/6 bg-slate-50 rounded-full" />
            </div>
        </div>
    );

    if (insights.length === 0) return null;

    return (
        <div className="rounded-[3rem] border border-slate-200 bg-white/70 p-10 shadow-xl backdrop-blur-[40px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />
            
            <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="text-xl animate-pulse">💡</span> SYSTEM_INTELLIGENCE: SMART_INDICATIONS
            </h3>

            <div className="space-y-8 relative z-10">
                <p className="text-slate-700 font-bold leading-relaxed text-base uppercase tracking-wider italic border-l-2 border-blue-500/30 pl-6">
                    {summary}
                </p>

                <div className="grid gap-6 sm:grid-cols-3">
                    {insights.map((insight, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:border-blue-500/50 hover:bg-blue-50 transition-all duration-500 group/item backdrop-blur-3xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-relaxed group-hover/item:text-blue-600 transition-colors italic">
                                {insight}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AiInsights;

