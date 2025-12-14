import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        setShowDropdown(false);

        // Simple logic to route based on content
        if (notification.message.toLowerCase().includes('appointment')) {
            navigate('/appointments');
        } else if (notification.type === 'MESSAGE') {
            navigate('/chat');
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification)} // Updated onClick
                                >
                                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
