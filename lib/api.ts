import axios, { AxiosError, AxiosInstance } from 'axios';

import { env } from '@/constants/env';

let _getToken: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>): void => {
  _getToken = getter;
};

const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};

    if (_getToken && !config.headers.Authorization) {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] Authorization token:', token);
      }
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request error]', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    console.error('[API Response error]', {
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
      code: error?.code,
    });
    return Promise.reject(error?.response?.data ?? { message: error?.message ?? 'Network error' });
  },
);

export { api };
