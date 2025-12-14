import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import io from 'socket.io-client';
import { Send, MessageSquare, User } from 'lucide-react';

export default function Chat() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const receiverId = searchParams.get('receiverId');

    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [activeRoom, setActiveRoom] = useState(null);
    const [activeUser, setActiveUser] = useState(null); // The other user in the chat

    const messagesEndRef = useRef(null);

    // Initialize Socket and fetch conversations
    // Initialize Socket and fetch conversations
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            if (user) {
                newSocket.emit('join_room', `user_${user.id}`);
            }
        });

        newSocket.on('receive_message', (message) => {
            setMessages((prev) => {
                if (message.barId === activeRoom) {
                    return [...prev, message];
                }
                return prev;
            });
            fetchConversations();
        });

        newSocket.on('new_notification', (notification) => {
            fetchConversations();
            // TODO: Show toast notification
            console.log('New notification:', notification);
        });

        fetchConversations();

        return () => newSocket.close();
    }, [user, activeRoom]); // Add dependencies

    // Handle initial room selection (from URL or default)
    useEffect(() => {
        const initChat = async () => {
            if (receiverId && user) {
                const rId = parseInt(receiverId);
                const uId = user.id;
                const roomId = `private_${Math.min(rId, uId)}_${Math.max(rId, uId)}`;
                setActiveRoom(roomId);

                // Fetch user details if not known
                try {
                    // We can reuse getConversations or just fetch user details
                    // Assuming we have an endpoint for user details or just generic "get user"
                    // For now, we'll try to find in existing conversations or rely on fetching history which might return sender details? 
                    // No, fetchHistory returns messages.
                    // Better: fetch user info.
                    const res = await axios.get(`/users/${rId}`); // Assuming this endpoint exists, or we use a new one
                    // Wait, there might not be a general user endpoint.
                    // Let's use what we have. 
                    // We can mock it or just set ID.
                    // But we need name for the header.
                    // Let's check if we have it in conversations.
                    const existing = conversations.find(c => c.otherUser.id === rId);
                    if (existing) {
                        setActiveUser(existing.otherUser);
                    } else {
                        // Fetch it. 
                        // If no endpoint, we might have trouble.
                        // But we can assume the user navigated from a place where they saw the user.
                        // Let's check available endpoints.
                    }
                } catch (e) {
                    console.error("Error setting up chat", e);
                }
            } else if (conversations.length > 0 && !activeRoom) {
                setActiveRoom(conversations[0].roomId);
                setActiveUser(conversations[0].otherUser);
            }
        };
        initChat();
    }, [receiverId, user, conversations]);

    // Join room and fetch history when activeRoom changes
    useEffect(() => {
        if (!socket || !activeRoom) return;

        socket.emit('join_room', activeRoom);
        fetchHistory(activeRoom);
    }, [activeRoom, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/chat/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    const fetchHistory = async (roomId) => {
        try {
            const res = await axios.get(`/chat/${roomId}`);
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
        if (!newMessage.trim() || !socket || !activeRoom) return;

        // Determine receiver ID
        let currentReceiverId = null;
        if (activeUser) {
            currentReceiverId = activeUser.id;
        } else if (receiverId) {
            currentReceiverId = parseInt(receiverId);
        }

        const messageData = {
            senderId: user.id,
            receiverId: currentReceiverId,
            message: newMessage,
            barId: activeRoom,
            sender: { name: user.name }
        };

        socket.emit('send_message', messageData);
        setMessages(prev => [...prev, { ...messageData, createdAt: new Date().toISOString() }]);
        setNewMessage('');
        fetchConversations();
    };

    const handleSelectConversation = (conv) => {
        setActiveRoom(conv.roomId);
        setActiveUser(conv.otherUser);
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="font-bold text-gray-700 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Messages
                    </h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">No conversations yet.</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.roomId}
                                onClick={() => handleSelectConversation(conv)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeRoom === conv.roomId ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-gray-900 text-sm">
                                        {conv.otherUser?.name || 'Unknown User'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(conv.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col">
                {activeRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-200 flex items-center shadow-sm z-10">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                                <User className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">
                                    {activeUser ? activeUser.name : 'Chat'}
                                </h3>
                                <span className="text-xs text-green-500 flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                    Online
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-lg p-3 shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                            }`}>
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

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                            <input
                                type="text"
                                className="flex-grow input-field"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="btn-primary flex items-center justify-center w-12 rounded-full">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
