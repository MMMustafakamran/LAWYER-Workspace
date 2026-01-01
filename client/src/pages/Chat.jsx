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
                // Use string IDs for MongoDB (no parseInt)
                const rId = receiverId;
                const uId = user.id;
                // Create room ID with sorted string IDs
                const roomId = `private_${[rId, uId].sort().join('_')}`;
                setActiveRoom(roomId);

                // Try to find user in existing conversations
                const existing = conversations.find(c => c.otherUser?._id === rId || c.otherUser?.id === rId);
                if (existing) {
                    setActiveUser(existing.otherUser);
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

    const [chatType, setChatType] = useState('private'); // 'private' or 'group'

    // ... (keep initChat useEffect)

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !activeRoom) return;

        let currentReceiverId = null;
        let roomId = activeRoom;

        if (chatType === 'private') {
            if (activeUser) {
                currentReceiverId = activeUser._id || activeUser.id;
            } else if (receiverId) {
                currentReceiverId = receiverId; // MongoDB string ID, no parseInt
            }
        } else {
            // Group chat
            // roomId is already the barId from activeRoom
            currentReceiverId = null; // No single receiver in group
        }

        const messageData = {
            senderId: user.id,
            receiverId: currentReceiverId,
            message: newMessage,
            barId: roomId,
            sender: { name: user.name }
        };

        socket.emit('send_message', messageData);
        setMessages(prev => [...prev, { ...messageData, createdAt: new Date().toISOString() }]);
        setNewMessage('');

        if (chatType === 'private') {
            fetchConversations();
        }
    };

    const handleSelectConversation = (conv) => {
        setActiveRoom(conv.roomId);
        setActiveUser(conv.otherUser);
    };

    const handleJoinBarRoom = () => {
        if (!user.barId) {
            alert("You are not associated with any Bar Association.");
            return;
        }
        setChatType('group');
        setActiveRoom(user.barId);
        setActiveUser({ name: `${user.barId} Room` }); // Mock user object for header
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg">
                        <button
                            onClick={() => { setChatType('private'); setActiveRoom(null); }}
                            className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-md transition-colors ${chatType === 'private' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Messages
                        </button>
                        <button
                            onClick={handleJoinBarRoom}
                            className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-md transition-colors ${chatType === 'group' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Bar Room
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {chatType === 'group' ? (
                        <div className="p-4">
                            {user.barId ? (
                                <div className={`p-4 border rounded-lg cursor-pointer bg-primary-50 border-l-4 border-l-primary-600`}>
                                    <h3 className="font-bold text-primary-900">{user.barId} Room</h3>
                                    <p className="text-xs text-gray-500 mt-1">Official Bar Association Group</p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 text-sm mt-4">
                                    You are not assigned to a Bar Association.
                                </div>
                            )}
                        </div>
                    ) : (
                        conversations.length === 0 ? (
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
                        )
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
