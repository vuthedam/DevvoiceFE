import axios from "axios";
import { getAccessToken, clearAuthStorage } from "../utils/storage.js";

const resolveBaseURL = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

  if (!apiUrl) {
    console.error(
      "[axios] Thiếu VITE_API_URL trong .env. Ví dụ: VITE_API_URL=http://localhost:3000/api"
    );
    return "http://localhost:3000/api";
  }

  if (import.meta.env.DEV && apiUrl.startsWith("/")) {
    console.warn(
      "[axios] baseURL đang trỏ tới Vite proxy (relative path). " +
        "Đặt VITE_API_URL=http://localhost:3000/api để gọi thẳng backend."
    );
  }

  return apiUrl;
};

const axiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error("[axios]", {
        url: error.config?.baseURL + error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message,
      });
    }

    if (error.response?.status === 401) {
      clearAuthStorage();
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
