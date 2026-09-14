import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

let lastRequestTime = 0;
const MIN_DELAY = 100;

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('access_token');
  const apiKey = localStorage.getItem('api_key');
  
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  
  // Exclude auth endpoints from requiring Bearer token
  if (token && !config.url.startsWith('/v1/auth/')) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Rate limiting logic
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_DELAY) {
    await new Promise(resolve => setTimeout(resolve, MIN_DELAY - timeSinceLast));
  }
  lastRequestTime = Date.now();

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // If we are not already on the login page, redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
