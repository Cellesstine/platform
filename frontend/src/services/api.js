import axios from "axios";
import { getAccessToken, clearAuth } from "./auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthEndpoint =
      url.includes("/account/login/") ||
      url.includes("/account/register/") ||
      url.includes("/account/password/reset/") ||
      url.includes("/account/verify-email/") ||
      url.includes("/account/reactivate/") ||
      url.includes("/account/reactivation-request/") ||
      url.includes("/account/resend-verification/") ||
      url.includes("/account/email/verify/");

    if (status === 401 && !isAuthEndpoint) {
      clearAuth();
      const path = window.location.pathname;
      if (!path.startsWith("/sign-in") && !path.startsWith("/register")) {
        window.location.assign(`/sign-in?next=${encodeURIComponent(path)}`);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/** Use mock auth when explicitly enabled. Default off so the real API is used. */
export function isMockApiEnabled() {
  return process.env.REACT_APP_MOCK_API === "true";
}
