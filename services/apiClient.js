const axios = require('axios');

const baseURL = process.env.BOT_API_BASE || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injeta Authorization Bearer com BOT_TOKEN, se existir
api.interceptors.request.use(
  (config) => {
    const token = process.env.BOT_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

module.exports = api;
