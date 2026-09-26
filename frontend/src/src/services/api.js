import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

//Interceptor will check localStorage on every req
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Token injected into headers:", token);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;