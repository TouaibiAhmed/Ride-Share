import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, X, Clock, UserCheck, UserX } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { ROUTES } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ onClose, onNotificationRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Close on click outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // Get only recent 5 notifications
            const data = await notificationService.getNotifications({ page_size: 5 });
            setNotifications(data.results || data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            onNotificationRead();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            onNotificationRead();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'ride_request':
                return <Clock className="text-blue-500" size={20} />;
            case 'request_accepted':
                return <UserCheck className="text-green-500" size={20} />;
            case 'request_declined':
                return <UserX className="text-red-500" size={20} />;
            default:
                return <Bell className="text-slate-500" size={20} />;
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <div className="flex items-center gap-2">
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-primary hover:text-primary-dark transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">
                        Loading notifications...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Bell size={48} className="mx-auto mb-3 text-slate-300" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/50' : ''
                                }`}
                            onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        >
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    {getNotificationIcon(notification.notification_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 mb-1">
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            {formatDistanceToNow(new Date(notification.created_at), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                        {!notification.is_read && (
                                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-200 text-center">
                    <Link
                        to={ROUTES.NOTIFICATIONS}
                        className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
                        onClick={onClose}
                    >
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
