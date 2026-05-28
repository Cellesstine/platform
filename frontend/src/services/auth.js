const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const ROLE_KEY = "userRole";
const EMAIL_KEY = "userEmail";
const APPLICANT_ID_KEY = "individualProfileId";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getUserRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function getUserEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function getIndividualProfileId() {
  return localStorage.getItem(APPLICANT_ID_KEY);
}

export function setIndividualProfileId(id) {
  if (id) {
    localStorage.setItem(APPLICANT_ID_KEY, id);
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function storeAuthFromResponse(data, email) {
  if (data?.access) {
    localStorage.setItem(ACCESS_KEY, data.access);
  }
  if (data?.refresh) {
    localStorage.setItem(REFRESH_KEY, data.refresh);
  }
  if (data?.role) {
    localStorage.setItem(ROLE_KEY, data.role);
  }
  if (email) {
    localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
  }
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(APPLICANT_ID_KEY);
}

export function getDashboardPath(role = getUserRole()) {
  if (role === "individual") {
    return "/professional/dashboard";
  }
  return "/dashboard";
}

/** Extract first API error string from a DRF-style response. */
export function parseApiError(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;
  if (!data) {
    if (err?.code === "ERR_NETWORK" || err?.message === "Network Error") {
      return "Cannot reach the server. Make sure the API is running.";
    }
    return fallback;
  }
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  if (Array.isArray(data.non_field_errors)?.[0]) {
    return String(data.non_field_errors[0]);
  }
  if (data && typeof data === "object") {
    const key = Object.keys(data)[0];
    if (key) {
      const value = data[key];
      if (Array.isArray(value) && value[0]) return String(value[0]);
      if (typeof value === "string") return value;
    }
  }
  return fallback;
}
