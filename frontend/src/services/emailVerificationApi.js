import api, { isMockApiEnabled } from "./api";

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

/** Dev mock tokens embed email + timestamp so validation works without sessionStorage (e.g. new tab, Strict Mode). */
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
    err.response = { data: { message: "This verification link is invalid or has expired." } };
    throw err;
  }
  return { valid: true, email: parsed.email, mock: true };
}

export function getMockVerifyEmailTo(portal) {
  const token = sessionStorage.getItem(tokenKey(portal));
  if (!token) return null;
  const base =
    portal === "professional"
      ? "/professional/onboarding/verify-email/confirm"
      : "/verify-email/confirm";
  return `${base}?token=${encodeURIComponent(token)}`;
}

export function getMockVerifyEmailLink(portal) {
  const to = getMockVerifyEmailTo(portal);
  if (!to) return null;
  return `${window.location.origin}${to}`;
}

const CONFIRM_PATHS = {
  professional: "/professional/onboarding/verify-email/confirm",
  business: "/verify-email/confirm",
};

export function getEmailConfirmPath(portal) {
  return CONFIRM_PATHS[portal];
}

async function mockSendVerification(portal, email) {
  await delay(300);
  createMockToken(portal, email);
  return { mock: true };
}

function isNetworkError(err) {
  return err.code === "ERR_NETWORK" || err.message === "Network Error" || !err.response;
}

/** POST /auth/verify-email/send — after account step */
export async function sendSignupVerificationEmail(portal, email) {
  if (isMockApiEnabled()) {
    return mockSendVerification(portal, email);
  }
  try {
    const { data } = await api.post("/auth/verify-email/send", { email, portal });
    return data;
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isNetworkError(err)) {
      return mockSendVerification(portal, email);
    }
    throw err;
  }
}

/** POST /auth/verify-email/resend */
export async function resendSignupVerificationEmail(portal, email) {
  if (isMockApiEnabled()) {
    return mockSendVerification(portal, email);
  }
  try {
    const { data } = await api.post("/auth/verify-email/resend", { email, portal });
    return data;
  } catch (err) {
    if (process.env.NODE_ENV === "development" && isNetworkError(err)) {
      return mockSendVerification(portal, email);
    }
    throw err;
  }
}

/** GET /auth/verify-email/validate?token= — email link lands on confirm route */
export async function validateSignupVerificationToken(token, portal) {
  const tryMockValidation = () => {
    const fromToken = validateMockVerifyToken(token, portal);
    if (fromToken) return fromToken;
    if (isValidMockToken(portal, token)) {
      const email = sessionStorage.getItem(storageKey(portal)) || "";
      return { valid: true, email, mock: true };
    }
    const err = new Error("Invalid or expired verification link.");
    err.response = { data: { message: "This verification link is invalid or has expired." } };
    throw err;
  };

  if (isMockApiEnabled()) {
    await delay(200);
    return tryMockValidation();
  }

  try {
    const { data } = await api.get("/auth/verify-email/validate", {
      params: { token, portal },
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

export function getEmailVerificationErrorMessage(err) {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (isNetworkError(err)) {
    return "Cannot reach the server. Run npm start for automatic mock mode in development.";
  }
  return "Something went wrong. Please try again.";
}

export function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}
