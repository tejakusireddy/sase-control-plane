import axios from 'axios';

// In production (Docker), nginx proxies /api to api-gateway, so use relative URLs
// In development, use VITE_API_URL or default to localhost
const API_URL = (import.meta.env?.PROD as boolean) 
  ? '' 
  : ((import.meta.env?.VITE_API_URL as string) || 'http://localhost:4000');

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

