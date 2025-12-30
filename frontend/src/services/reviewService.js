import api from './api';
export const reviewService = {
    // Get all reviews
    getAllReviews: async () => {
        const response = await api.get('/reviews/');
        return response.data;
    },
    // Create a review
    create: async (reviewData) => {
        const response = await api.post('/reviews/create/', reviewData);
        return response.data;
    },
    // Get review details
    getById: async (id) => {
        const response = await api.get(`/reviews/${id}/`);
        return response.data;
    },
    // Get reviews for a user
    getUserReviews: async (userId) => {
        const response = await api.get(`/reviews/user/${userId}/`);
        return response.data;
    },
    // Get reviews for a ride
    getRideReviews: async (rideId) => {
        const response = await api.get(`/reviews/ride/${rideId}/`);
        return response.data;
    },
};