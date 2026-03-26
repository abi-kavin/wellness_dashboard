import { useState, useEffect, useRef } from 'react';
import { sendMessage, getFacultyMessages, deleteMessage } from '../services/api';

const MessageModal = ({ student, onClose }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [fetching, setFetching] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => { fetchHistory(); }, [student._id]);

    // Auto-scroll to latest message whenever history updates
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const fetchHistory = async () => {
        try {
            setFetching(true);
            const { data } = await getFacultyMessages(student._id);
            // Reverse so oldest is at top (API returns newest-first)
            setHistory([...data].reverse());
        } catch {
            console.error('Failed to fetch history');
        } finally {
            setFetching(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            const { data: sent } = await sendMessage({ receiverId: student._id, message: text.trim() });
            setHistory(prev => [...prev, sent]);
            setText('');
        } catch {
            alert('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await deleteMessage(id);
            setHistory(prev => prev.filter(m => m._id !== id));
        } catch {
            alert('Failed to delete');
        }
    };

    const fmtTime = (d) => {
        const dt = new Date(d);
        const today = new Date();
        const isToday = dt.toDateString() === today.toDateString();
        return isToday
            ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : dt.toLocaleDateString([], { day: '2-digit', month: 'short' }) + ' · ' +
            dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Group messages by date
    const grouped = history.reduce((acc, msg) => {
        const day = new Date(msg.createdAt).toDateString();
        if (!acc[day]) acc[day] = [];
        acc[day].push(msg);
        return acc;
    }, {});

    const dayLabel = (dateStr) => {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (dateStr === today) return 'Today';
        if (dateStr === yesterday) return 'Yesterday';
        return new Date(dateStr).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
                style={{ height: '85vh', maxHeight: '640px' }}>

                {/* ── Header ── */}
                <div className="flex items-center gap-4 px-6 py-4 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-black text-base leading-tight truncate">{student.name}</h3>
                        <p className="text-indigo-200 text-xs font-semibold">{student.registerNumber} · {student.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">
                            {history.length} message{history.length !== 1 ? 's' : ''}
                        </span>
                        <button onClick={onClose}
                            className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-black transition-all">
                            ✕
                        </button>
                    </div>
                </div>

                {/* ── Message History ── */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 bg-slate-50/50">
                    {fetching ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="h-8 w-8 rounded-full border-3 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">💬</div>
                            <p className="font-black text-slate-600">No messages yet</p>
                            <p className="text-xs text-slate-400 font-semibold">Send your first message to {student.name} below</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([day, msgs]) => (
                            <div key={day} className="space-y-3">
                                {/* Date divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-slate-200" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                                        {dayLabel(day)}
                                    </span>
                                    <div className="flex-1 h-px bg-slate-200" />
                                </div>

                                {msgs.map((msg) => (
                                    <div key={msg._id} className="group flex justify-end">
                                        <div className="max-w-[80%] space-y-1">
                                            {/* Message bubble */}
                                            <div className="relative rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm"
                                                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                                <p className="text-white text-sm leading-relaxed font-medium">{msg.message}</p>
                                                {/* Delete on hover */}
                                                <button
                                                    onClick={() => handleDelete(msg._id)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
                                                    title="Delete message"
                                                >✕</button>
                                            </div>
                                            {/* Time + read status */}
                                            <div className="flex items-center justify-end gap-2 pr-1">
                                                <span className="text-[10px] text-slate-400 font-semibold">{fmtTime(msg.createdAt)}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-wide ${msg.isRead ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {msg.isRead ? '✓✓ Read' : '✓ Sent'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                    {/* Scroll anchor */}
                    <div ref={bottomRef} />
                </div>

                {/* ── Compose ── */}
                <div className="px-4 py-4 bg-white border-t border-slate-100 shrink-0">
                    <form onSubmit={handleSend} className="flex gap-3 items-end">
                        <textarea
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none transition-all font-medium"
                            placeholder={`Message ${student.name}...`}
                            value={text}
                            rows={2}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !text.trim()}
                            className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-lg transition-all active:scale-95 disabled:opacity-40 shrink-0 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                            title="Send (Enter)"
                        >
                            {loading ? (
                                <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            ) : '➤'}
                        </button>
                    </form>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1.5 pl-1">Press Enter to send · Shift+Enter for new line</p>
                </div>
            </div>
        </div>
    );
};

export default MessageModal;
