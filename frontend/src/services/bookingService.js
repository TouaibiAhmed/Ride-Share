import api from './api';

export const bookingService = {
    // Get all bookings
    getAllBookings: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const url = queryParams ? `/bookings/?${queryParams}` : '/bookings/';
        const response = await api.get(url);
        return response.data;
    },

    // Create a booking (request to join ride)
    create: async (bookingData) => {
        const response = await api.post('/bookings/create/', bookingData);
        return response.data;
    },

    // Get booking details
    getById: async (id) => {
        const response = await api.get(`/bookings/${id}/`);
        return response.data;
    },

    // Get user's booking requests
    getMyRequests: async () => {
        const response = await api.get('/bookings/my-requests/');
        return response.data;
    },

    // Get bookings for a specific ride
    getRideBookings: async (rideId) => {
        const response = await api.get(`/bookings/ride/${rideId}/`);
        return response.data;
    },

    // Accept a booking
    accept: async (bookingId) => {
        const response = await api.patch(`/bookings/${bookingId}/accept/`);
        return response.data;
    },

    // Decline a booking
    decline: async (bookingId) => {
        const response = await api.patch(`/bookings/${bookingId}/decline/`);
        return response.data;
    },

    // Cancel a booking
    cancel: async (bookingId) => {
        const response = await api.delete(`/bookings/${bookingId}/`);
        return response.data;
    },
};