import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidEmail } from "../../utils/accountValidation";
import {
  PasswordResetShell,
  PasswordResetTopbar,
  PasswordResetStepper,
  GradientButton,
} from "./passwordReset/shared";
import {
  requestPasswordReset,
  savePasswordResetSession,
  getPasswordResetErrorMessage,
} from "../../services/passwordResetApi";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = isValidEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError("");
    const trimmed = email.trim();
    try {
      await requestPasswordReset(trimmed);
      const expiresAt = savePasswordResetSession(trimmed);
      navigate("/verify-code", { state: { email: trimmed, expiresAt } });
    } catch (err) {
      setError(getPasswordResetErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PasswordResetShell topbar={<PasswordResetTopbar />}>
      <div className="w-14 h-14 bg-pro-blue/40 rounded-2xl flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="#8b1a1a" strokeWidth="1.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#8b1a1a" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="15" r="1.5" fill="#8b1a1a" />
        </svg>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-normal mb-3">Forgot your password?</h1>
      <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">
        No worries. Enter the email address linked to your account and we&apos;ll send you a reset link.
      </p>

      <PasswordResetStepper current={1} />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md text-left"
      >
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm mb-1 outline-none focus:border-navy focus:bg-white"
        />
        <p className="text-xs text-gray-400 mb-5">We&apos;ll send a reset link to this address.</p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <GradientButton type="submit" disabled={!canSubmit || loading}>
          {loading ? "Sending…" : "Send Reset Link →"}
        </GradientButton>

        <p className="text-sm text-gray-500 text-center mt-5">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/sign-in")}
            className="text-navy font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </form>
    </PasswordResetShell>
  );
}
