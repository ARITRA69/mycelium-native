import axios, { AxiosError, AxiosInstance } from 'axios';

import { env } from '@/constants/env';

const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
