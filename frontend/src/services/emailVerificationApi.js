import { isMockApiEnabled } from "./api";
import { verifyEmail as apiVerifyEmail, resendVerificationEmail as apiResendVerification } from "./accountApi";
import { buildAccountEmailLink, signupVerifyConfirmPath, getFrontendOrigin } from "../utils/accountEmailLinks";

export const EMAIL_VERIFY_TTL_SECONDS = 15 * 60;

const storageKey = (portal) => `emailVerify_${portal}_email`;
const expiresKey = (portal) => `emailVerify_${portal}_expiresAt`;
const tokenKey = (portal) => `emailVerify_${portal}_token`;
const verifiedKey = (portal) => `emailVerify_${portal}_verified`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function saveEmailVerificationSession(portal, email) {
  const expiresAt = Date.now() + EMAIL_VERIFY_TTL_SECONDS * 1000;
  sessionStorage.setItem(storageKey(portal), email);
  sessionStorage.setItem(expiresKey(portal), String(expiresAt));
  return expiresAt;
}

export function getEmailVerificationSession(portal) {
  const email = sessionStorage.getItem(storageKey(portal));
  const expiresAt = Number(sessionStorage.getItem(expiresKey(portal)) || 0);
  if (!email || !expiresAt) return null;
  return { email, expiresAt };
}

export function markEmailVerified(portal, email) {
  sessionStorage.setItem(verifiedKey(portal), email);
  sessionStorage.removeItem(tokenKey(portal));
}

export function isEmailVerified(portal) {
  return Boolean(sessionStorage.getItem(verifiedKey(portal)));
}

function createMockToken(portal, email) {
  const token = `verify.dev.${portal}.${Date.now()}.${encodeURIComponent(email)}`;
  sessionStorage.setItem(tokenKey(portal), token);
  return token;
}

function isValidMockToken(portal, token) {
  const stored = sessionStorage.getItem(tokenKey(portal));
  return Boolean(token && stored && token === stored);
}

export function parseMockVerifyToken(token, portal) {
  const prefix = `verify.dev.${portal}.`;
  if (!token || !token.startsWith(prefix)) return null;
  const rest = token.slice(prefix.length);
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

function validateMockVerifyToken(token, portal) {
  const parsed = parseMockVerifyToken(token, portal);
  if (!parsed) return null;
  if (Date.now() - parsed.timestamp > EMAIL_VERIFY_TTL_SECONDS * 1000) {
    const err = new Error("Expired verification link.");
    err.response = { data: { error: "This verification link is invalid or has expired." } };
    throw err;
  }
  return { valid: true, email: parsed.email, mock: true };
}

/** Mock link uses backend-shaped path on frontend: /account/verify-email/... */
export function getMockVerifyEmailTo(portal) {
  const token = sessionStorage.getItem(tokenKey(portal));
  if (!token) return null;
  return accountEmailPathForPortal(portal, "mockuid", token);
}

function accountEmailPathForPortal(portal, uidb64, token) {
  return signupVerifyConfirmPath(portal, uidb64, token);
}

export function getMockVerifyEmailLink(portal) {
  const to = getMockVerifyEmailTo(portal);
  if (!to) return null;
  return `${getFrontendOrigin()}${to}`;
}

/** Backend email URL shape on frontend (with ?portal= for redirect handler). */
export function getMockVerifyEmailBackendShapedLink(portal) {
  const token = sessionStorage.getItem(tokenKey(portal));
  if (!token) return null;
  return `${getFrontendOrigin()}${buildAccountEmailLink("verify-email", "mockuid", token).replace(getFrontendOrigin(), "")}?portal=${portal}`;
}

export function getEmailConfirmPath(portal) {
  return portal === "professional"
    ? "/professional/onboarding/verify-email/confirm"
    : "/verify-email/confirm";
}

async function mockSendVerification(portal, email) {
  await delay(300);
  createMockToken(portal, email);
  return { mock: true };
}

function isNetworkError(err) {
  return err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response;
}

/** Signup verification is sent by POST /account/register/ only. */
export async function sendSignupVerificationEmail(portal, email) {
  if (isMockApiEnabled()) {
    return mockSendVerification(portal, email);
  }
  return { detail: "Verification email is sent when you register." };
}

/** POST /account/resend-verification/ — inactive accounts that never signed in. */
export async function resendSignupVerificationEmail(portal, email) {
  if (isMockApiEnabled()) {
    return mockSendVerification(portal, email);
  }
  try {
    return await apiResendVerification(email);
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isNetworkError(err)) {
      return mockSendVerification(portal, email);
    }
    throw err;
  }
}

/** GET /account/verify-email/:uidb64/:token/ */
export async function validateSignupVerificationToken(uidb64, token, portal) {
  const tryMockValidation = () => {
    const fromToken = validateMockVerifyToken(token, portal);
    if (fromToken) return fromToken;
    if (isValidMockToken(portal, token)) {
      const email = sessionStorage.getItem(storageKey(portal)) || "";
      return { valid: true, email, mock: true };
    }
    const err = new Error("Invalid or expired verification link.");
    err.response = { data: { error: "This verification link is invalid or has expired." } };
    throw err;
  };

  if (isMockApiEnabled()) {
    await delay(200);
    return tryMockValidation();
  }

  try {
    return await apiVerifyEmail(uidb64, token);
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isNetworkError(err)) {
      await delay(200);
      return tryMockValidation();
    }
    throw err;
  }
}

export function getEmailVerificationErrorMessage(err) {
  if (err.response?.data?.detail) return err.response.data.detail;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (isNetworkError(err)) {
    return "Cannot reach the server. Ensure the API is running at REACT_APP_API_URL.";
  }
  return "Something went wrong. Please try again.";
}

export function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}
