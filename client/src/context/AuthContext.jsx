import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user on startup
    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token) {
                setLoading(false);
                return;
            }
            
            const res = await api.get('/auth/me');
            if (res.data.success) {
                setUser(res.data.data);
            }
        } catch (err) {
            console.error(err);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const res = await api.post('/auth/register', userData);
            if (res.data.success) {
                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                    setUser(res.data.user);
                    return { success: true };
                }
                return { success: true, pending: true, message: res.data.message };
            }
        } catch (err) {
             setError(err.response?.data?.message || 'Registration failed');
             return { success: false };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tempEmail');
            setUser(null);
            window.location.href = '/login';
        } catch (err) {
            console.error(err);
            // Even if API fails, clear local data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tempEmail');
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
