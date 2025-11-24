/// <reference types="vite/client" />

import axios from 'axios';
import { env } from '../../utils/env';

const api = axios.create({
  baseURL: env.baseUrl,
  timeout: 10000,
});

const redirectToLogin = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  try {
    const hashPath = window.location.hash?.slice(1) || '/home';
    const returnTo = encodeURIComponent(hashPath);
    window.location.href = `/#/login?returnTo=${returnTo}`;
  } catch {
    window.location.href = '/#/login';
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers) {
      const isFormData =
        typeof FormData !== 'undefined' && config.data instanceof FormData;

      if (isFormData) {
        delete config.headers['Content-Type'];
      } else if (!('Content-Type' in config.headers)) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;