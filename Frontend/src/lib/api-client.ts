import axios from 'axios';
import { store } from '@/redux/store';
import { clearCredentials } from '@/redux/userSlice';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const state = store.getState();
      const refreshToken = state.user.refreshToken;
      if (refreshToken) {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
            { refreshToken },
            { withCredentials: true },
          );
          return apiClient(originalRequest);
        } catch {
          store.dispatch(clearCredentials());
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
