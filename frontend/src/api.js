import axios from 'axios';


// Create axios instance with base URL
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Basic error handling response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized - Please log in');
            // Optionally redirect to login or clear stored token
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
        return Promise.reject(error);
    }
);

export default api;
