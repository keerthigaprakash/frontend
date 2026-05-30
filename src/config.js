// src/config.js
// Use Vite environment variables in production, localhost in development
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_BASE_URL = isDev
  ? 'http://localhost:5000/api'
  : import.meta.env.VITE_API_BASE_URL || 'https://backend-cedj.onrender.com/api';

export const SOCKET_URL = isDev
  ? 'http://localhost:5000'
  : import.meta.env.VITE_SOCKET_URL || 'https://backend-cedj.onrender.com';
