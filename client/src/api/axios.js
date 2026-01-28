import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Important for Cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to attach token if we decide to store it in memory/localStorage (optional if using cookies only for auth)
// But since we are returning token in JSON, let's use it for Authorization header for double security or just standard Bearer flow.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
