import axios from 'axios';

const TOKEN_KEY = 'clinic_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      if (!location.pathname.startsWith('/login')) location.href = '/login';
    }
    return Promise.reject(error);
  }
);
