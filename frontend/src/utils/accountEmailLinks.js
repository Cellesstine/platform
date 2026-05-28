/**
 * Build frontend URLs for links that mirror backend email templates.
 * Backend emails use: {protocol}://{domain}/account/...
 * SPA routes at the same paths call the API then continue in-app.
 */

const FRONTEND_ORIGIN =
  process.env.REACT_APP_FRONTEND_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:3000");

export function getFrontendOrigin() {
  return FRONTEND_ORIGIN.replace(/\/$/, "");
}

/** SPA route used after signup verify (differs by portal). */
export function signupVerifyConfirmPath(portal, uidb64, token) {
  const encodedToken = encodeURIComponent(token);
  if (portal === "professional") {
    return `/professional/onboarding/verify-email/confirm/${uidb64}/${encodedToken}`;
  }
  return `/verify-email/confirm/${uidb64}/${encodedToken}`;
}

/** Paths that match backend email URL structure on the frontend host. */
export function accountEmailPath(type, uidb64, token) {
  const encodedToken = encodeURIComponent(token);
  switch (type) {
    case "verify-email":
      return `/account/verify-email/${uidb64}/${encodedToken}`;
    case "reactivate":
      return `/account/reactivate/${uidb64}/${encodedToken}`;
    case "password-reset":
      return `/account/password/reset/${uidb64}/${encodedToken}`;
    case "email-verify":
      return `/account/email/verify/${uidb64}/${encodedToken}`;
    default:
      return "/";
  }
}

export function buildAccountEmailLink(type, uidb64, token) {
  return `${getFrontendOrigin()}${accountEmailPath(type, uidb64, token)}`;
}

/**
 * Rewrite an API-host email link to the frontend origin, keeping /account/... path.
 * @param {string} rawUrl
 * @param {{ portal?: 'business' | 'professional' }} [options]
 */
export function rewriteApiEmailLinkToFrontend(rawUrl, options = {}) {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;

  try {
    const parsed = new URL(rawUrl);
    const path = parsed.pathname.replace(/\/$/, "") || parsed.pathname;

    const verifyMatch = path.match(/^\/account\/verify-email\/([^/]+)\/(.+)$/);
    if (verifyMatch) {
      const [, uidb64, token] = verifyMatch;
      const portal = options.portal || "business";
      return `${getFrontendOrigin()}${signupVerifyConfirmPath(portal, uidb64, decodeURIComponent(token))}`;
    }

    const reactivateMatch = path.match(/^\/account\/reactivate\/([^/]+)\/(.+)$/);
    if (reactivateMatch) {
      const [, uidb64, token] = reactivateMatch;
      return buildAccountEmailLink("reactivate", uidb64, decodeURIComponent(token));
    }

    const resetMatch = path.match(/^\/account\/password\/reset\/([^/]+)\/(.+)$/);
    if (resetMatch) {
      const [, uidb64, token] = resetMatch;
      return buildAccountEmailLink("password-reset", uidb64, decodeURIComponent(token));
    }

    const emailChangeMatch = path.match(/^\/account\/email\/verify\/([^/]+)\/(.+)$/);
    if (emailChangeMatch) {
      const [, uidb64, token] = emailChangeMatch;
      return buildAccountEmailLink("email-verify", uidb64, decodeURIComponent(token));
    }

    if (path.startsWith("/account/")) {
      return `${getFrontendOrigin()}${path}${parsed.search}`;
    }
  } catch {
    // Not a full URL — return as-is.
  }
  return rawUrl;
}

export function getEmailLinkHelpText(type) {
  switch (type) {
    case "verify-email":
      return "If the link opens the API site (port 8000), copy the path after /account/ and open it on this app (port 3000) under the same /account/... path, or use the confirm link shown in dev mode.";
    case "password-reset":
      return "The reset link should open this app at /account/password/reset/… — not the API JSON page.";
    case "reactivate":
      return "The reactivation link should open this app at /account/reactivate/…";
    default:
      return "";
  }
}
