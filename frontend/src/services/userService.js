import api from './api';
export const userService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/users/register/', userData);
        return response.data;
    },
    // Login user
    login: async (email, password) => {
        const response = await api.post('/users/login/', { email, password });
        return response.data;
    },
    // Logout user
    logout: async () => {
        const response = await api.post('/users/logout/');
        return response.data;
    },
    // Get current user profile
    getCurrentUser: async () => {
        const response = await api.get('/users/me/');
        return response.data;
    },
    // Get user by ID
    getUserById: async (userId) => {
        const response = await api.get(`/users/${userId}/`);
        return response.data;
    },
    // Get user statistics
    getUserStats: async (userId) => {
        const response = await api.get(`/users/${userId}/stats/`);
        return response.data;
    },
    // Update user profile
  updateCurrentUser: async (userData, isFormData = false) => {
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return (await api.patch('/users/me/', userData, config)).data;
},

};


export default userService;
