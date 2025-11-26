import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import io from 'socket.io-client';
import { Send, MessageSquare } from 'lucide-react';

export default function Chat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // For this demo, we'll use a single global room "General"
    // In a real app, this would be dynamic based on selected conversation
    const ROOM_ID = "General";

    useEffect(() => {
        // Connect to Socket.io
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('join_room', ROOM_ID);

        newSocket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        fetchHistory();

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`/chat/${ROOM_ID}`);
            setMessages(res.data);
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            senderId: user.id,
            message: newMessage,
            barId: ROOM_ID,
            sender: { name: user.name } // Optimistic update
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-primary-900 p-4 text-white flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-bold">General Chat</h2>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === user.id;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 shadow-sm ${isMe ? 'bg-primary-600 text-white' : 'bg-white text-gray-800 border border-gray-200'
                                }`}>
                                {!isMe && (
                                    <p className="text-xs font-bold text-primary-600 mb-1">
                                        {msg.sender?.name || 'Unknown'}
                                    </p>
                                )}
                                <p className="text-sm">{msg.message}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    className="flex-grow input-field"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn-primary flex items-center justify-center w-12">
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
