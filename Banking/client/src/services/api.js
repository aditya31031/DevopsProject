import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-logout on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export const accountAPI = {
    getAll: () => api.get('/accounts'),
    create: (data) => api.post('/accounts', data),
    deposit: (id, data) => api.post(`/accounts/${id}/deposit`, data),
    withdraw: (id, data) => api.post(`/accounts/${id}/withdraw`, data),
};

export const transactionAPI = {
    getAll: () => api.get('/transactions'),
    getHistory: (accountId) => api.get(`/transactions/${accountId}`),
    transfer: (data) => api.post('/transactions/transfer', data),
};

export default api;
