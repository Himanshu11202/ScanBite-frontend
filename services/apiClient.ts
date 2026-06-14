import axios from "axios";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://scanbite-backend.onrender.com";
const api = axios.create({
  baseURL: rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ONLY JWT attach (NO URL modification)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sb_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;