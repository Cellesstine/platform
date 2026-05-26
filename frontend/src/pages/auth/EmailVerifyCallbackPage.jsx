import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  validateSignupVerificationToken,
  markEmailVerified,
  getEmailVerificationSession,
} from "../../services/emailVerificationApi";

export default function EmailVerifyCallbackPage({ portal, nextPath }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing verification token.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await validateSignupVerificationToken(token, portal);
        const email = data?.email || getEmailVerificationSession(portal)?.email || "";
        markEmailVerified(portal, email);
        if (!cancelled) {
          navigate(nextPath, { replace: true, state: { email } });
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "This verification link is invalid or has expired."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, portal, nextPath, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-sans">
        <p className="text-sm text-gray-500">Verifying your email…</p>
      </div>
    );
  }

  const pendingRoute =
    portal === "professional" ? "/professional/onboarding/verify-email" : "/verify-email";

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 font-sans text-center">
      <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md shadow-sm">
        <p className="text-sm text-red-600 mb-6">{error}</p>
        <button
          type="button"
          onClick={() => navigate(pendingRoute)}
          className="px-6 py-3 bg-navy text-white rounded-full text-sm font-medium hover:bg-navy/90"
        >
          Back to verification →
        </button>
      </div>
    </div>
  );
}
