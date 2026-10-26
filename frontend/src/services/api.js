import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const apiUrl = configuredApiUrl
  ? `${/^https?:\/\//i.test(configuredApiUrl) ? '' : 'https://'}${configuredApiUrl}`.replace(/\/+$/, '')
  : 'http://localhost:5000';
const apiBaseUrl = /\/api$/i.test(apiUrl) ? apiUrl : `${apiUrl}/api`;

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pocket_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
