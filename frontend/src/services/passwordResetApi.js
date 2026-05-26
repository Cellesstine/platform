import api, { isMockApiEnabled } from "./api";

/** Link validity window (must match backend email TTL). */
export const PASSWORD_RESET_TTL_SECONDS = 15 * 60;

const STORAGE_EMAIL = "passwordResetEmail";
const STORAGE_EXPIRES_AT = "passwordResetExpiresAt";
const MOCK_TOKEN_KEY = "mockPasswordResetToken";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function savePasswordResetSession(email) {
  const expiresAt = Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000;
  sessionStorage.setItem(STORAGE_EMAIL, email);
  sessionStorage.setItem(STORAGE_EXPIRES_AT, String(expiresAt));
  return expiresAt;
}

export function getPasswordResetSession() {
  const email = sessionStorage.getItem(STORAGE_EMAIL);
  const expiresAt = Number(sessionStorage.getItem(STORAGE_EXPIRES_AT) || 0);
  if (!email || !expiresAt) return null;
  return { email, expiresAt };
}

export function clearPasswordResetSession() {
  sessionStorage.removeItem(STORAGE_EMAIL);
  sessionStorage.removeItem(STORAGE_EXPIRES_AT);
  sessionStorage.removeItem(MOCK_TOKEN_KEY);
}

/** Dev-only: link shown on step 2 when mock API is on (no real email sent). */
export function getMockResetLink() {
  const token = sessionStorage.getItem(MOCK_TOKEN_KEY);
  if (!token) return null;
  return `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`;
}

function createMockToken(email) {
  const token = `dev.${Date.now()}.${encodeURIComponent(email)}`;
  sessionStorage.setItem(MOCK_TOKEN_KEY, token);
  return token;
}

function isValidMockToken(token) {
  const stored = sessionStorage.getItem(MOCK_TOKEN_KEY);
  return Boolean(token && stored && token === stored);
}

/** Dev mock tokens embed email + timestamp (works without sessionStorage). */
function parseMockPasswordResetToken(token) {
  if (!token?.startsWith("dev.")) return null;
  const rest = token.slice(4);
  const dot = rest.indexOf(".");
  if (dot <= 0) return null;
  const timestamp = Number(rest.slice(0, dot));
  const emailEnc = rest.slice(dot + 1);
  if (!Number.isFinite(timestamp) || !emailEnc) return null;
  try {
    const email = decodeURIComponent(emailEnc);
    if (!email) return null;
    return { timestamp, email };
  } catch {
    return null;
  }
}

function validateMockPasswordResetToken(token) {
  const parsed = parseMockPasswordResetToken(token);
  if (!parsed) return null;
  if (Date.now() - parsed.timestamp > PASSWORD_RESET_TTL_SECONDS * 1000) {
    const err = new Error("Expired reset link.");
    err.response = { data: { message: "This reset link is invalid or has expired." } };
    throw err;
  }
  return { valid: true, mock: true };
}

async function mockRequestPasswordReset(email) {
  await delay(300);
  createMockToken(email);
  return { mock: true };
}

function isNetworkError(err) {
  return err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response;
}

/** POST /auth/forgot-password — sends reset email */
export async function requestPasswordReset(email) {
  if (isMockApiEnabled()) {
    return mockRequestPasswordReset(email);
  }

  try {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isNetworkError(err)) {
      return mockRequestPasswordReset(email);
    }
    throw err;
  }
}

/** POST /auth/forgot-password/resend — resend after cooldown */
export async function resendPasswordReset(email) {
  if (isMockApiEnabled()) {
    return mockRequestPasswordReset(email);
  }

  try {
    const { data } = await api.post("/auth/forgot-password/resend", { email });
    return data;
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isNetworkError(err)) {
      return mockRequestPasswordReset(email);
    }
    throw err;
  }
}

/** GET /auth/reset-password/validate?token= — called when user opens email link */
export async function validatePasswordResetToken(token) {
  const tryMockValidation = () => {
    const fromToken = validateMockPasswordResetToken(token);
    if (fromToken) return fromToken;
    if (isValidMockToken(token)) {
      return { valid: true, mock: true };
    }
    const err = new Error("Invalid or expired reset link.");
    err.response = { data: { message: "This reset link is invalid or has expired." } };
    throw err;
  };

  if (isMockApiEnabled()) {
    await delay(200);
    return tryMockValidation();
  }

  try {
    const { data } = await api.get("/auth/reset-password/validate", {
      params: { token },
    });
    return data;
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isNetworkError(err)) {
      await delay(200);
      return tryMockValidation();
    }
    throw err;
  }
}

/** POST /auth/reset-password — set new password using token from email */
export async function completePasswordReset(token, password) {
  const isMockTokenValid = () =>
    Boolean(validateMockPasswordResetToken(token) || isValidMockToken(token));

  if (isMockApiEnabled()) {
    await delay(300);
    if (!isMockTokenValid()) {
      const err = new Error("Invalid token");
      err.response = { data: { message: "This reset link is invalid or has expired." } };
      throw err;
    }
    clearPasswordResetSession();
    return { mock: true };
  }

  const { data } = await api.post("/auth/reset-password", { token, password });
  return data;
}

/** Map axios/network failures to a clear message for the UI */
export function getPasswordResetErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (isNetworkError(err)) {
    return (
      "Cannot reach the server. Start your API on port 5000, or run the app with npm start (development uses mock mode automatically)."
    );
  }
  return "Unable to send reset link. Please try again.";
}
