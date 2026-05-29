import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LinkioBrand from "./LinkioBrand";
import { isMockApiEnabled } from "../services/api";
import {
  getEmailVerificationSession,
  resendSignupVerificationEmail,
  saveEmailVerificationSession,
  getEmailVerificationErrorMessage,
  getMockVerifyEmailTo,
} from "../services/emailVerificationApi";

const PORTAL_CONFIG = {
  professional: {
    accentText: "text-navy",
    accentBtn: "text-navy hover:text-navy/80",
    changeEmailRoute: "/professional/onboarding/account",
    guardRoute: "/professional/onboarding/account",
  },
  business: {
    accentText: "text-red",
    accentBtn: "text-red hover:text-red/80",
    changeEmailRoute: "/register",
    guardRoute: "/register",
  },
};

export default function EmailVerificationPending({ portal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const config = PORTAL_CONFIG[portal];

  const session = getEmailVerificationSession(portal);
  const email = location.state?.email || session?.email || "";

  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const mockTo = isMockApiEnabled() ? getMockVerifyEmailTo(portal) : null;
  const mockLink = mockTo ? `${window.location.origin}${mockTo}` : null;

  useEffect(() => {
    if (!email && !getEmailVerificationSession(portal)?.email) {
      navigate(config.guardRoute, { replace: true });
    }
  }, [email, navigate, config.guardRoute, portal]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (resendLoading || cooldown > 0) return;
    setResendLoading(true);
    setResendError("");
    setResendSuccess(false);
    try {
      await resendSignupVerificationEmail(portal, email);
      saveEmailVerificationSession(portal, email);
      setResendSuccess(true);
      setCooldown(30);
    } catch (err) {
      setResendError(getEmailVerificationErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <div className="linkio-topbar">
        <LinkioBrand />
        <button
          type="button"
          onClick={() => navigate("/sign-in")}
          className="text-sm text-gray-500 hover:text-navy transition-colors cursor-pointer"
        >
          ← Sign out
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        {/* Envelope Logo */}
        <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={config.accentText}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-navy font-normal mb-3">
          Verify your email address
        </h1>

        <p className="text-gray-600 max-w-md text-base leading-relaxed mb-6">
          We&apos;ve sent a verification link to{" "}
          <strong className="text-gray-900 font-semibold">{email}</strong>.
          Please click the link in that email to activate your account.
        </p>

        {/* Resend Email Functionality */}
        <div className="mt-2 flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || cooldown > 0}
              className={`font-semibold underline transition-colors cursor-pointer ${
                cooldown > 0 ? "text-gray-400 cursor-not-allowed" : config.accentBtn
              }`}
            >
              {resendLoading
                ? "Sending..."
                : cooldown > 0
                ? `Resend email (wait ${cooldown}s)`
                : "Resend email"}
            </button>
          </p>
          {resendSuccess && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 flex items-center gap-1.5 animate-fade-in">
              ✓ A new verification link has been sent!
            </p>
          )}
          {resendError && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5">
              {resendError}
            </p>
          )}
        </div>

        {/* Mock/Development link */}
        {mockLink && (
          <div className="mt-8 p-6 bg-white border border-gray-150 rounded-2xl shadow-sm text-left text-sm text-gray-700 max-w-md w-full">
            <p className={`font-semibold mb-2 ${config.accentText}`}>Development mode (no backend)</p>
            <p className="mb-3 text-xs text-gray-500">
              No email is sent. Open this link to continue — the same URL your API would put in the email:
            </p>
            <Link to={mockTo} className={`${config.accentText} font-semibold break-all underline hover:opacity-85`}>
              {mockLink}
            </Link>
          </div>
        )}

        <p className="flex items-center justify-center gap-2 text-sm text-gray-500 flex-wrap mt-8">
          <span aria-hidden>✉</span>
          Wrong email address?{" "}
          <button
            type="button"
            onClick={() => navigate(config.changeEmailRoute)}
            className={`${config.accentText} font-semibold hover:underline cursor-pointer`}
          >
            Change email →
          </button>
        </p>
      </div>
    </div>
  );
}
