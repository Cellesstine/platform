import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

export default api;

/** Use mock auth when explicitly enabled, or in local dev unless turned off. */
export function isMockApiEnabled() {
  if (process.env.REACT_APP_MOCK_API === "false") return false;
  if (process.env.REACT_APP_MOCK_API === "true") return true;
  return process.env.NODE_ENV === "development";
}
