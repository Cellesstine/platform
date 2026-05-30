import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const [cooldown, setCooldown] = useState(60); // Starts with 60 seconds cooldown on mount

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
      setCooldown(60); // Wait 60 seconds on subsequent clicks
    } catch (err) {
      setResendError(getEmailVerificationErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-between py-16 px-6 font-sans">
      {/* Spacer to align content nicely vertically */}
      <div className="h-4" />

      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-center max-w-md w-full flex-grow text-center">
        {/* Beautiful Custom Envelope Card Logo */}
        <div className="w-24 h-24 bg-gradient-to-tr from-white to-gray-50 border border-gray-150 rounded-[28px] shadow-[0_12px_28px_rgba(27,58,92,0.06)] flex items-center justify-center mb-8 relative hover:scale-105 transition-transform duration-300">
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className={config.accentText}
          >
            <rect width="20" height="16" x="2" y="4" rx="3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        {/* Original Texting Restored */}
        <h1 className="font-serif text-3xl md:text-4xl text-navy font-normal mb-3">
          Verify your email address
        </h1>

        <p className="text-gray-600 max-w-md text-base leading-relaxed mb-8">
          We&apos;ve sent a verification link to{" "}
          <strong className="text-gray-900 font-semibold">{email}</strong>.
          Please click the link in that email to activate your account.
        </p>

        {/* Resend Email Functionality */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto mb-4">
          {cooldown > 0 ? (
            <div className="w-full py-3 px-6 rounded-full bg-gray-100 border border-gray-200 text-gray-400 font-semibold text-[11px] tracking-wider uppercase select-none text-center cursor-not-allowed shadow-sm">
              Resend link available in {cooldown}s
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className={`w-full py-3 px-6 rounded-full font-semibold text-[11px] tracking-wider uppercase text-center cursor-pointer transition-all duration-300 border ${
                portal === "professional"
                  ? "bg-navy text-white hover:bg-navy-deep border-navy shadow-[0_4px_12px_rgba(27,58,92,0.15)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-red text-white hover:bg-red-dark border-red shadow-[0_4px_12px_rgba(127,29,29,0.15)] hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {resendLoading ? "Sending..." : "Resend verification email"}
            </button>
          )}

          {resendSuccess && (
            <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 flex items-center gap-1.5 mt-2 animate-fade-in font-medium">
              ✓ A new verification link has been sent!
            </p>
          )}

          {resendError && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5 mt-2 font-medium">
              {resendError}
            </p>
          )}
        </div>

        {/* Mock/Development link */}
        {mockLink && (
          <div className="mt-10 p-5 bg-white border border-gray-150 rounded-2xl shadow-sm text-left text-xs text-gray-600 max-w-sm w-full">
            <p className={`font-semibold mb-2 ${config.accentText}`}>Development mode (no backend)</p>
            <p className="mb-3 text-[11px] text-gray-400 leading-normal">
              No email is sent. Open this link to continue:
            </p>
            <Link to={mockTo} className={`${config.accentText} font-semibold break-all underline hover:opacity-85`}>
              {mockLink}
            </Link>
          </div>
        )}
      </div>

      {/* Clean change email link at the absolute bottom */}
      <div className="text-xs text-gray-400 select-none mt-auto pt-12 pb-4">
        Wrong email address?{" "}
        <button
          type="button"
          onClick={() => navigate(config.changeEmailRoute)}
          className={`${config.accentText} font-semibold underline hover:opacity-85 cursor-pointer`}
        >
          Change email
        </button>
      </div>
    </div>
  );
}
