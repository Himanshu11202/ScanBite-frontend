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
});

// Attach JWT token, log every request, and configure dynamic timeouts based on retry attempts
api.interceptors.request.use(
  (config) => {
    // Determine attempt number (1-based index)
    const attempt = (config as any)._attempt || 1;
    // First request has a 90s timeout to accommodate cold starts, subsequent requests have 30s.
    config.timeout = attempt === 1 ? 90000 : 30000;
    (config as any)._attempt = attempt;

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sb_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    console.log(`[API Request] Attempt ${attempt} | ${config.method?.toUpperCase()} ${config.url || ""} | Timeout: ${config.timeout}ms`, {
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

// Log response, retry on timeout/network failures, and handle errors elegantly
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url || ""}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Check if error is due to a timeout or network error (e.g. server wake up latency)
    const isTimeoutOrNetworkError = 
      error.code === 'ECONNABORTED' || 
      error.message.includes('timeout') || 
      error.message.includes('Network Error');

    if (config && isTimeoutOrNetworkError) {
      const attempt = config._attempt || 1;
      const maxRetries = 2; // Maximum 2 retries (total 3 attempts)
      
      if (attempt <= maxRetries) {
        config._attempt = attempt + 1;
        console.warn(`[API Retry] Attempt ${attempt} failed due to timeout/network error. Retrying attempt ${config._attempt} in 1.5 seconds...`);
        // Wait 1.5s before retrying to allow the server/DB to finish waking up
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return api(config);
      }
    }

    let customMessage = error.message;
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      customMessage = "The request timed out. The server or database might be waking up from a cold start. Please try again.";
    } else if (error.message.includes('Network Error')) {
      customMessage = "Network error occurred. The server may be waking up, offline, or experiencing database connection delays. Please try again.";
    }

    if (error.response) {
      if (!error.response.data) {
        error.response.data = customMessage;
      } else if (typeof error.response.data === 'object') {
        error.response.data = { message: customMessage, ...error.response.data };
      }
    } else {
      error.response = {
        status: 408,
        statusText: "Request Timeout",
        data: customMessage,
        headers: {},
        config: error.config,
      };
    }

    console.error(`[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url || ""}`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;