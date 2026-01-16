import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercept request untuk menambahkan token
api.interceptors.request.use((config) => {
  // Gunakan localStorage hanya di client-side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept response untuk handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Hanya redirect ke login jika bukan di halaman login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Cek apakah kita sedang berada di halaman login
      const isLoginPage = window.location.pathname.includes('/login');
      
      if (!isLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;