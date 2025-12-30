import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const data = await notificationService.getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Poll for new notifications every 10 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationRead = () => {
        // Refresh count when notification is read
        fetchUnreadCount();
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown
                    onClose={() => setIsOpen(false)}
                    onNotificationRead={handleNotificationRead}
                />
            )}
        </div>
    );
};

export default NotificationBell;
