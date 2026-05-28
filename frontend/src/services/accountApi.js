import api from "./api";
import { ACCOUNT_API } from "../constants/accountEndpoints";
import { getRefreshToken } from "./auth";

// ── Registration & session ───────────────────────────────────────────────────

export async function register({ email, password, password_confirm, role }) {
  const { data } = await api.post(ACCOUNT_API.register, {
    email,
    password,
    password_confirm,
    role,
  });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post(ACCOUNT_API.login, { email, password });
  return data;
}

export async function logout() {
  const refresh = getRefreshToken();
  if (!refresh) return;
  try {
    await api.post(ACCOUNT_API.logout, { refresh });
  } catch {
    // Clear local session even if blacklist fails on the server.
  }
}

// ── Email verification (signup) ──────────────────────────────────────────────

export async function verifyEmail(uidb64, token) {
  const { data } = await api.get(ACCOUNT_API.verifyEmail(uidb64, token));
  return data;
}

export async function resendVerificationEmail(email) {
  const { data } = await api.post(ACCOUNT_API.resendVerification, { email });
  return data;
}

// ── Reactivation ─────────────────────────────────────────────────────────────

export async function requestReactivation(email) {
  const { data } = await api.post(ACCOUNT_API.reactivationRequest, { email });
  return data;
}

export async function reactivateAccount(uidb64, token) {
  const { data } = await api.get(ACCOUNT_API.reactivate(uidb64, token));
  return data;
}

// ── Email change ─────────────────────────────────────────────────────────────

export async function changeEmail({ new_email, password }) {
  const body = { new_email };
  if (password) body.password = password;
  const { data } = await api.post(ACCOUNT_API.emailChange, body);
  return data;
}

export async function verifyEmailChange(uidb64, token) {
  const { data } = await api.get(ACCOUNT_API.emailVerifyChange(uidb64, token));
  return data;
}

// ── Password ─────────────────────────────────────────────────────────────────

export async function requestPasswordReset(email) {
  const { data } = await api.post(ACCOUNT_API.passwordReset, { email });
  return data;
}

export async function confirmPasswordReset(uidb64, token, { new_password, new_password_confirm }) {
  const { data } = await api.post(ACCOUNT_API.passwordResetConfirm(uidb64, token), {
    new_password,
    new_password_confirm,
  });
  return data;
}

export async function changePassword({ password, new_password, new_password_confirm }) {
  const { data } = await api.post(ACCOUNT_API.passwordChange, {
    password,
    new_password,
    new_password_confirm,
  });
  return data;
}

export async function setPassword({ new_password, new_password_confirm }) {
  const { data } = await api.post(ACCOUNT_API.passwordSet, {
    new_password,
    new_password_confirm,
  });
  return data;
}

// ── Account lifecycle ────────────────────────────────────────────────────────

export async function deactivateAccount(password) {
  const { data } = await api.post(ACCOUNT_API.accountDeactivate, { password });
  return data;
}

export async function deleteAccount(password) {
  await api.delete(ACCOUNT_API.accountDelete, { data: { password } });
}
