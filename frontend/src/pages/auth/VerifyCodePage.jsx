import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PasswordResetShell,
  PasswordResetTopbar,
} from "./passwordReset/shared";
import {
  getPasswordResetSession,
  resendPasswordReset,
  getPasswordResetErrorMessage,
  getMockResetLink,
} from "../../services/passwordResetApi";
import { isMockApiEnabled } from "../../services/api";

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const session = getPasswordResetSession();
  const email = location.state?.email || session?.email || "";
  const [cooldown, setCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      if (!email) {
        navigate("/forgot-password", { replace: true });
      }
    }, 0);
    return () => clearTimeout(t);
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendError("");
    try {
      await resendPasswordReset(email);
      setCooldown(60);
    } catch (err) {
      setResendError(getPasswordResetErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  }, [cooldown, resendLoading, email]);

  if (!email) return null;

  const mockResetLink = isMockApiEnabled() ? getMockResetLink() : null;

  return (
    <PasswordResetShell topbar={<PasswordResetTopbar backTo="/forgot-password" backLabel="Back" />}>
      <div className="flex flex-col items-center justify-center text-center max-w-md px-6">
        {/* Email Envelope Logo */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="w-16 h-16 bg-[#4c0527]/10 rounded-full flex items-center justify-center animate-fade-in">
            <svg className="w-8 h-8 text-[#4c0527]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth={1.5} />
              <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          </div>
          <span className="absolute top-0 right-0 w-5 h-5 bg-[#4c0527] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
            ✓
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-navy-deep font-normal mb-3 leading-snug">Check your inbox</h1>
        
        {/* Whole/Full Email displayed clearly */}
        <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">
          We sent a password reset link to <br />
          <strong className="text-gray-900 break-all text-base block mt-2 font-medium bg-[#4c0527]/5 px-4 py-2 rounded-lg">{email}</strong>
        </p>

        {/* Resending box with 60s wait cooldown */}
        <div className="w-full max-w-sm bg-[#4c0527]/5 border border-[#4c0527]/10 rounded-xl p-4 text-center mb-6 mx-auto">
          {resendError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3 text-left">
              {resendError}
            </p>
          )}

          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            {cooldown > 0 ? (
              <>
                Didn&apos;t receive the email? Request a new link in <strong className="text-gray-900">{cooldown}s</strong>.
              </>
            ) : (
              <>
                Didn&apos;t receive the email? Check your spam folder or request a new link below.
              </>
            )}
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resendLoading}
            className={`w-full py-2.5 rounded-linkio text-xs font-semibold text-white transition-all
              ${cooldown > 0 || resendLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#4c0527] hover:bg-[#330319] text-white"}`}
          >
            {resendLoading ? "Sending…" : cooldown > 0 ? `Resend link (${cooldown}s)` : "Resend link"}
          </button>
        </div>

        {mockResetLink && (
          <div className="w-full mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-left text-sm text-gray-700">
            <p className="font-medium text-[#4c0527] mb-2">Development mode (no backend)</p>
            <p className="mb-2 text-xs text-gray-500">
              No email is sent. Open this link to continue to step 3:
            </p>
            <a href={mockResetLink} className="text-[#4c0527] font-semibold break-all underline hover:text-[#330319]">
              {mockResetLink}
            </a>
          </div>
        )}

        <p className="text-sm text-center">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-[#4c0527] font-medium hover:underline"
          >
            Use a different email
          </button>
        </p>
      </div>
    </PasswordResetShell>
  );
}
