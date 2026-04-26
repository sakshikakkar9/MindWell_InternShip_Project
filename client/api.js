import axios from 'axios';

const API = axios.create({
  // Vercel will inject this value from its dashboard settings
  baseURL: import.meta.env.VITE_API_URL || 'https://mindwell-internship-project.onrender.com/api'
});

export default API;
