import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LinkioBrand from "./LinkioBrand";
import { isMockApiEnabled } from "../services/api";
import {
  getEmailVerificationSession,
  resendSignupVerificationEmail,
  saveEmailVerificationSession,
  getEmailVerificationErrorMessage,
  getMockVerifyEmailTo,
  maskEmail,
  EMAIL_VERIFY_TTL_SECONDS,
} from "../services/emailVerificationApi";

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const PORTAL_CONFIG = {
  professional: {
    logoBg: "bg-navy",
    accentText: "text-navy",
    accentBtn: "text-navy",
    stepCircle: "bg-navy/10 text-navy",
    badge: "bg-gold/15 text-navy border border-gold/30",
    changeEmailRoute: "/professional/onboarding/account",
    guardRoute: "/professional/onboarding/account",
  },
  business: {
    logoBg: "bg-red",
    accentText: "text-red",
    accentBtn: "text-red",
    stepCircle: "bg-red/10 text-red",
    badge: "bg-gold/15 text-navy border border-gold/30",
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
  const initialExpiresAt =
    location.state?.expiresAt || session?.expiresAt || Date.now() + EMAIL_VERIFY_TTL_SECONDS * 1000;

  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((initialExpiresAt - Date.now()) / 1000))
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");

  const canResend = secondsLeft === 0 && Boolean(email);
  const mockTo = isMockApiEnabled() ? getMockVerifyEmailTo(portal) : null;
  const mockLink = mockTo ? `${window.location.origin}${mockTo}` : null;

  const step3Text =
    portal === "professional"
      ? "Your account will be activated and you can complete your profile"
      : "Your account will be activated and you can set up your company";

  useEffect(() => {
    const t = setTimeout(() => {
      if (!email && !getEmailVerificationSession(portal)?.email) {
        navigate(config.guardRoute, { replace: true });
      }
    }, 0);
    return () => clearTimeout(t);
  }, [email, navigate, config.guardRoute, portal]);

  useEffect(() => {
    const tick = () => setSecondsLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const handleResend = useCallback(async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setResendError("");
    try {
      await resendSignupVerificationEmail(portal, email);
      const newExpiresAt = saveEmailVerificationSession(portal, email);
      setExpiresAt(newExpiresAt);
      setSecondsLeft(Math.max(0, Math.floor((newExpiresAt - Date.now()) / 1000)));
    } catch (err) {
      setResendError(getEmailVerificationErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  }, [canResend, resendLoading, email, portal]);

  if (!email) return null;

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <div className="linkio-topbar">
        <LinkioBrand />
        <button
          type="button"
          onClick={() => navigate("/sign-in")}
          className="text-sm text-gray-500 hover:text-navy transition-colors"
        >
          ← Sign out
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-5">
          <div className="absolute w-32 h-32 rounded-full border border-gray-200" />
          <div className="absolute w-24 h-24 rounded-full border border-gray-100" />
          <div className="relative z-10">
            <svg width="44" height="36" viewBox="0 0 40 32" fill="none" aria-hidden>
              <rect x="1" y="1" width="38" height="28" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1.5" />
              <path d="M1 5 L20 18 L39 5" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="32" cy="6" r="6" fill="#f59e0b" />
              <text x="32" y="9.5" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">
                !
              </text>
            </svg>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full mb-5 ${config.badge}`}
        >
          ⏱ Awaiting verification
        </span>

        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-normal mb-3">
          Verify your email address
        </h1>
        <p className="text-sm text-gray-500 mb-1">We&apos;ve sent a verification link to</p>
        <p className="font-semibold text-gray-900 mb-8">{maskEmail(email)}</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md mb-6 text-left">
          <p className="text-[11px] tracking-widest text-gray-400 uppercase mb-6 font-semibold">How to verify</p>

          <ol className="flex flex-col gap-5 mb-6">
            {[
              <>
                Open the email from <strong>noreply@linkio.dz</strong>
              </>,
              <>
                Click <strong>&quot;Verify my email&quot;</strong> in the message we sent you.
              </>,
              <>{step3Text}</>,
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4 text-sm text-gray-600">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${config.stepCircle}`}
                >
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{text}</span>
              </li>
            ))}
          </ol>

          <div className="bg-amber-light border border-amber/20 rounded-xl px-4 py-3 flex gap-3 text-sm text-amber-900 mb-6">
            <span className="text-base flex-shrink-0">⏱</span>
            <span>
              {secondsLeft > 0 ? (
                <>
                  This link expires in <strong>{formatCountdown(secondsLeft)}</strong>. You can request a new email
                  after it expires.
                </>
              ) : (
                <>
                  This link has expired. Use <strong>Resend email</strong> to get a new one.
                </>
              )}
            </span>
          </div>

          {resendError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
              {resendError}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm pt-5 border-t border-gray-100">
            <span className="text-gray-500">Didn&apos;t receive it? Check your spam folder.</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || resendLoading}
              className={`font-semibold text-left sm:text-right transition-colors
                ${canResend && !resendLoading
                  ? `${config.accentBtn} hover:underline`
                  : "text-gray-300 cursor-not-allowed"}`}
            >
              {resendLoading ? "Sending…" : "Resend email →"}
            </button>
          </div>

          {mockLink && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-left text-sm text-gray-700">
              <p className={`font-medium mb-2 ${config.accentText}`}>Development mode (no backend)</p>
              <p className="mb-2 text-xs text-gray-500">
                No email is sent. Open this link to continue — the same URL your API would put in the email:
              </p>
              <Link to={mockTo} className={`${config.accentText} font-semibold break-all underline`}>
                {mockLink}
              </Link>
            </div>
          )}
        </div>

        <p className="flex items-center justify-center gap-2 text-sm text-gray-500 flex-wrap">
          <span aria-hidden>✉</span>
          Wrong email address?{" "}
          <button
            type="button"
            onClick={() => navigate(config.changeEmailRoute)}
            className={`${config.accentText} font-semibold hover:underline`}
          >
            Change email →
          </button>
        </p>
      </div>
    </div>
  );
}
