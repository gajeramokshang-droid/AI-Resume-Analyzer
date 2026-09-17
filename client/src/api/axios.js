import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


// React Page
//     ↓ calls
// client/src/api/axios.js
//     ↓ sends HTTP request to
// server/index.js (port 5000)
//     ↓ routes to
// server/routes/*.js
//     ↓ talks to
// MongoDB + Python analyzer

