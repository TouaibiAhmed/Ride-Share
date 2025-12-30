import api from './api';

export const rideService = {
    // Get all rides
    getAllRides: async (params = {}) => {
        const response = await api.get('/rides/', { params });
        return response.data;
    },

    // Search rides
    search: async (filters) => {
        const response = await api.get('/rides/search/', { params: filters });
        return response.data;
    },

    // Get ride details
    getById: async (id) => {
        const response = await api.get(`/rides/${id}/`);
        return response.data;
    },

    // Create a new ride
    create: async (rideData) => {
        const response = await api.post('/rides/', rideData);
        return response.data;
    },

    // Update a ride
    update: async (id, rideData) => {
        const response = await api.put(`/rides/${id}/`, rideData);
        return response.data;
    },

    // Delete a ride
    delete: async (id) => {
        const response = await api.delete(`/rides/${id}/`);
        return response.data;
    },

    // Get user's rides (as driver)
    getMyRides: async () => {
        const response = await api.get('/rides/my-rides/');
        return response.data;
    },


    // Manage user's car - FIXED METHOD
    createOrUpdateCar: async (carData, isFormData = false) => {
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        // Use PATCH instead of POST for update operation
        const response = await api.patch('/rides/car/', carData, config);
        return response.data;
    },

    // Get user's car
    getCar: async () => {
        const response = await api.get('/rides/car/');
        return response.data;
    },
};