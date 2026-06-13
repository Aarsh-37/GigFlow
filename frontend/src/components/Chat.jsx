import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import socket from '../socket';
import { Send, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const Chat = ({ gigId, isEmbedded }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chat/${gigId}`);
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
            setLoading(false);
        };

        fetchMessages();

        // Join gig-specific room
        socket.emit('join_gig', gigId);

        // Listen for new messages
        socket.on('new_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off('new_message');
        };
    }, [gigId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSending(true);
        try {
            const { data } = await api.post(`/chat/${gigId}`, { content });
            // socket will handle adding to messages via 'new_message' event
            setContent('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
        setSending(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
    );

    return (
        <div className={`flex flex-col ${isEmbedded ? 'h-full' : 'h-[500px] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700'} bg-white dark:bg-gray-800 overflow-hidden`}>
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Project Chat</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Secure Scoped Channel</p>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 opacity-60">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Send size={20} />
                        </div>
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.senderId._id === userInfo._id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] flex items-end gap-2 ${msg.senderId._id === userInfo._id ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {msg.senderId.avatar ? (
                                        <img src={msg.senderId.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={12} className="text-slate-400" />
                                    )}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm ${msg.senderId._id === userInfo._id
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-slate-100 text-slate-700 rounded-bl-none'
                                    }`}>
                                    <div>{msg.content}</div>
                                    <div className={`text-[9px] mt-1 opacity-60 ${msg.senderId._id === userInfo._id ? 'text-right' : 'text-left'}`}>
                                        {format(new Date(msg.createdAt), 'h:mm a')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-50 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type a message..."
                        className="input-field pr-12 rounded-full border-slate-200 focus:border-primary-500 focus:ring-primary-100"
                    />
                    <button
                        type="submit"
                        disabled={sending || !content.trim()}
                        className="absolute right-1.5 top-1.5 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
