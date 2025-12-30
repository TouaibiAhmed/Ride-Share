import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Check for stored token and fetch user
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await userService.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);
    const login = async (email, password) => {
        try {
            const response = await userService.login(email, password);
            
            // Store tokens
            localStorage.setItem('token', response.access);
            if (response.refresh) {
                localStorage.setItem('refreshToken', response.refresh);
            }
            
            // Fetch and store user data
            const userData = await userService.getCurrentUser();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };
    const register = async (userData) => {
        try {
            const response = await userService.register(userData);
            
            // After registration, log the user in
            await login(userData.email, userData.password);
            
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

const refreshUser = async () => {
    try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    } catch (err) {
        console.error('refreshUser failed', err);
        throw err;
    }
};

    
    const logout = async () => {
        try {
            await userService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    };
    return (
<AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

