import { isMockApiEnabled } from "./api";
import {
  requestPasswordReset as apiRequestPasswordReset,
  confirmPasswordReset as apiConfirmPasswordReset,
} from "./accountApi";
import { buildAccountEmailLink } from "../utils/accountEmailLinks";

/** Link validity window shown in UI (backend token TTL may differ). */
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

/** Dev-only: link matching backend email path on the frontend host. */
export function getMockResetLink() {
  const token = sessionStorage.getItem(MOCK_TOKEN_KEY);
  if (!token) return null;
  return buildAccountEmailLink("password-reset", "mockuid", token);
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
    err.response = { data: { error: "This reset link is invalid or has expired." } };
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

/** POST /account/password/reset/ */
export async function requestPasswordReset(email) {
  if (isMockApiEnabled()) {
    return mockRequestPasswordReset(email);
  }

  try {
    return await apiRequestPasswordReset(email);
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isNetworkError(err)) {
      return mockRequestPasswordReset(email);
    }
    throw err;
  }
}

/** POST /account/password/reset/ — resend */
export async function resendPasswordReset(email) {
  return requestPasswordReset(email);
}

/** POST /account/password/reset/:uidb64/:token/ */
export async function completePasswordReset(uidb64, token, password) {
  const isMockTokenValid = () =>
    Boolean(validateMockPasswordResetToken(token) || isValidMockToken(token));

  if (isMockApiEnabled()) {
    await delay(300);
    if (!isMockTokenValid()) {
      const err = new Error("Invalid token");
      err.response = { data: { error: "This reset link is invalid or has expired." } };
      throw err;
    }
    clearPasswordResetSession();
    return { mock: true };
  }

  return apiConfirmPasswordReset(uidb64, token, {
    new_password: password,
    new_password_confirm: password,
  });
}

export function getPasswordResetErrorMessage(err) {
  if (err.response?.data?.detail) return err.response.data.detail;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (isNetworkError(err)) {
    return "Cannot reach the server. Ensure the API is running (default http://127.0.0.1:8000) or enable REACT_APP_MOCK_API=true.";
  }
  return "Unable to send reset link. Please try again.";
}
