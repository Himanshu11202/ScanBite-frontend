import axios from "axios";

let rawUrl = (process.env.NEXT_PUBLIC_API_URL || "https://scanbite-backend.onrender.com").trim();
// Remove trailing slashes to prevent double slashes in subpaths
rawUrl = rawUrl.replace(/\/+$/, "");
const baseURL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds to accommodate Render's cold start latency
});

// Attach JWT token and log every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sb_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url || ""}`, {
      baseURL: config.baseURL,
      url: config.url,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error(`[API Request Error]`, error);
    return Promise.reject(error);
  }
);

// Log every response (success and error)
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url || ""}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url || ""}`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;