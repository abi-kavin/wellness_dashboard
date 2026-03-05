import { useState, useEffect } from 'react';
import { sendMessage, getFacultyMessages, deleteMessage } from '../services/api';

const MessageModal = ({ student, onClose }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [student._id]);

    const fetchHistory = async () => {
        try {
            const { data } = await getFacultyMessages(student._id);
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch history');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            await sendMessage({ receiverId: student._id, message });
            setMessage('');
            fetchHistory(); // Refresh history
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this message?')) {
            try {
                await deleteMessage(id);
                setHistory(history.filter(m => m._id !== id));
            } catch (err) {
                alert('Failed to delete');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Conversation with {student.name}</h3>
                        <p className="text-blue-100 text-sm opacity-90">{student.registerNumber}</p>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 h-64 overflow-y-auto space-y-4 pr-2 custom-scrollbar border-b pb-4">
                        {fetching ? (
                            <p className="text-center text-slate-400 py-10">Loading history...</p>
                        ) : history.length > 0 ? (
                            history.map((msg) => (
                                <div key={msg._id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 relative group">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(msg.createdAt).toLocaleString()}</span>
                                        <button
                                            onClick={() => handleDelete(msg._id)}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-700">{msg.message}</p>
                                    <span className={`text-[9px] font-bold uppercase ${msg.isRead ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {msg.isRead ? 'Read' : 'Unread'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 py-10">No message history.</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">New Message</label>
                            <textarea
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MessageModal;
