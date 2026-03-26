import { useState, useRef, useEffect } from 'react';
import { askAi } from '../services/api';
import ReactMarkdown from 'react-markdown';

const AiChatAssist = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am your Wellness AI. I can list students, analyze risk levels (High/Medium/Low), or create stress management schedules. How can I help?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            const { data } = await askAi(userMsg);
            setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "I'm experiencing technical difficulties. Please ensure the backend is connected and API keys are set." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:scale-110 active:scale-95 border border-white/20 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                {isOpen ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative z-10">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
                        </span>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-24 right-0 w-[420px] h-[600px] max-h-[85vh] bg-white/70 backdrop-blur-[40px] border border-slate-200 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 relative z-[9999] group/chat">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 relative z-10 shadow-lg flex items-start justify-between">
                        <div>
                            <h4 className="text-xl font-bold flex items-center gap-3 text-white tracking-tight leading-none">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse" />
                                Wellness AI Assistant
                            </h4>
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-3">
                                Predictive Analysis // Online
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 -mr-2 -mt-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90"
                            title="Quit Session"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10 scrollbar-hide">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] shadow-sm border ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none border-blue-500'
                                    : 'bg-white text-slate-700 rounded-tl-none border-slate-100 shadow-xl shadow-slate-200/50 prose prose-sm max-w-none'
                                    }`}>
                                    {m.role === 'user' ? (
                                        <p className="leading-relaxed whitespace-pre-wrap m-0 font-medium">{m.text}</p>
                                    ) : (
                                        <div className="markdown-body font-medium">
                                            <ReactMarkdown>{m.text}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start animate-in fade-in duration-300">
                                <div className="bg-white px-6 py-4 rounded-[1.5rem] rounded-tl-none border border-slate-100 shadow-md">
                                    <div className="flex gap-2">
                                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" />
                                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-4 relative z-10 backdrop-blur-3xl">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 focus:bg-white outline-none transition-all duration-300"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-500 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:grayscale"
                        >
                            <svg className="h-6 w-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AiChatAssist;
