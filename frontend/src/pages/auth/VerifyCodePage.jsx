import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PasswordResetShell,
  PasswordResetTopbar,
  PasswordResetStepper,
} from "./passwordReset/shared";
import {
  getPasswordResetSession,
  resendPasswordReset,
  savePasswordResetSession,
  getPasswordResetErrorMessage,
  getMockResetLink,
  PASSWORD_RESET_TTL_SECONDS,
} from "../../services/passwordResetApi";
import { isMockApiEnabled } from "../../services/api";

function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const session = getPasswordResetSession();
  const email = location.state?.email || session?.email || "";
  const initialExpiresAt =
    location.state?.expiresAt || session?.expiresAt || Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000;

  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((initialExpiresAt - Date.now()) / 1000))
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");

  const canResend = secondsLeft === 0 && Boolean(email);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!email && !getPasswordResetSession()?.email) {
        navigate("/forgot-password", { replace: true });
      }
    }, 0);
    return () => clearTimeout(t);
  }, [email, navigate]);

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
      await resendPasswordReset(email);
      const newExpiresAt = savePasswordResetSession(email);
      setExpiresAt(newExpiresAt);
      setSecondsLeft(Math.max(0, Math.floor((newExpiresAt - Date.now()) / 1000)));
    } catch (err) {
      setResendError(getPasswordResetErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  }, [canResend, resendLoading, email]);

  if (!email) return null;

  const mockResetLink = isMockApiEnabled() ? getMockResetLink() : null;

  return (
    <PasswordResetShell topbar={<PasswordResetTopbar backTo="/forgot-password" backLabel="← Back" />}>
      <div className="relative w-14 h-14 mb-6">
        <div className="w-14 h-14 bg-pro-blue/40 rounded-2xl flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#1b2d52" strokeWidth="1.5" />
            <path d="M3 7l9 6 9-6" stroke="#1b2d52" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-navy rounded-full text-white text-[10px] flex items-center justify-center">
          ✓
        </span>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-normal mb-3">Check your inbox</h1>
      <p className="text-sm text-gray-500 mb-8">
        We sent a password reset link to <strong className="text-gray-900">{maskEmail(email)}</strong>
      </p>

      <PasswordResetStepper current={2} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md text-left">
        <ol className="space-y-5 mb-6">
          {[
            <>
              Open the email from <strong>noreply@workbridge.dz</strong>
            </>,
            <>
              Click <strong>&quot;Reset my password&quot;</strong> in the email we sent you
            </>,
            <>You&apos;ll be taken to step 3 to set a new password</>,
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-4 text-sm text-gray-600">
              <span className="w-7 h-7 rounded-full bg-pro-blue/50 text-navy text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="pt-1 leading-relaxed">{text}</span>
            </li>
          ))}
        </ol>

        <div className="bg-amber-light border border-amber/20 rounded-xl px-4 py-3 flex gap-3 text-sm text-amber-900 mb-6">
          <span className="text-base flex-shrink-0">⏱</span>
          <span>
            {secondsLeft > 0 ? (
              <>
                This link expires in <strong>{formatCountdown(secondsLeft)}</strong>. You can request a new link
                after it expires.
              </>
            ) : (
              <>
                This link has expired. Use <strong>Resend link</strong> to get a new email.
              </>
            )}
          </span>
        </div>

        {resendError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {resendError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <span className="text-gray-500">Didn&apos;t receive it? Check your spam folder.</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className={`font-semibold text-left sm:text-right transition-colors
              ${canResend && !resendLoading
                ? "text-navy hover:underline"
                : "text-gray-300 cursor-not-allowed"}`}
          >
            {resendLoading ? "Sending…" : "Resend link →"}
          </button>
        </div>

        {mockResetLink && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-left text-sm text-gray-700">
            <p className="font-medium text-navy mb-2">Development mode (no backend)</p>
            <p className="mb-2 text-xs text-gray-500">
              No email is sent. Open this link to continue to step 3 — the same URL your API would put in the email:
            </p>
            <a href={mockResetLink} className="text-navy font-semibold break-all underline">
              {mockResetLink}
            </a>
          </div>
        )}

        <p className="text-sm text-center mt-6 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-navy font-medium hover:underline"
          >
            Wrong address? Use a different email →
          </button>
        </p>
      </div>
    </PasswordResetShell>
  );
}
