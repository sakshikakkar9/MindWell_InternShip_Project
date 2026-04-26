import axios from 'axios';

const API = axios.create({
  // Vercel will inject this value from its dashboard settings
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true // 👈 CRITICAL: This matches your backend CORS configuration
});

export default API;
