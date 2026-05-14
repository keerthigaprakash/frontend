// src/config.js
// Dynamically resolve hostname so it works on both localhost and mobile IP
const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const port = '5000';

export const API_BASE_URL = `http://${host}:${port}/api`;
export const SOCKET_URL = `http://${host}:${port}`;
