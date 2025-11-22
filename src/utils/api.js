import axios from 'axios';

// Use env variable, fallback to current origin
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // if cookies/sessions are used
});

export default api;