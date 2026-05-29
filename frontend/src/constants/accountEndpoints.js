/**
 * Account API paths — must match dev/src/apps/accounts/urls.py (mounted at /account/).
 */
export const ACCOUNT_API = {
  register: "/account/register/",
  login: "/account/login/",
  logout: "/account/logout/",
  verifyEmail: (uidb64, token) => `/account/verify-email/${uidb64}/${token}/`,
  resendVerification: "/account/resend-verification/",
  reactivationRequest: "/account/reactivation-request/",
  reactivate: (uidb64, token) => `/account/reactivate/${uidb64}/${token}/`,
  emailChange: "/account/email/change/",
  emailVerifyChange: (uidb64, token) => `/account/email/verify/${uidb64}/${token}/`,
  passwordReset: "/account/password/reset/",
  passwordResetConfirm: (uidb64, token) => `/account/password/reset/${uidb64}/${token}/`,
  passwordChange: "/account/password/change/",
  passwordSet: "/account/password/set/",
  accountDelete: "/account/account/delete/",
  accountDeactivate: "/account/account/deactivate/",
  securityStatus: "/account/security-status/",
};
