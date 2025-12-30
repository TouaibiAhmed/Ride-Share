import api from './api';

export const notificationService = {
    // Get all notifications
    getNotifications: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const url = queryParams ? `/notifications/?${queryParams}` : '/notifications/';
        const response = await api.get(url);
        return response.data;
    },

    // Get notification by ID
    getById: async (id) => {
        const response = await api.get(`/notifications/${id}/`);
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read/`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.post('/notifications/mark-all-read/');
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count/');
        return response.data;
    },
};
