import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  PasswordResetShell,
  PasswordResetTopbar,
  PasswordResetStepper,
  GradientButton,
} from "./passwordReset/shared";
import {
  validatePasswordResetToken,
  completePasswordReset,
  clearPasswordResetSession,
} from "../../services/passwordResetApi";

function PasswordField({ label, value, onChange, showMatch }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border text-sm outline-none focus:bg-white transition-colors
            ${showMatch ? "border-green-400 focus:border-green-500" : "border-gray-100 focus:border-navy"}`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {showMatch ? "✓" : visible ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}

function StrengthMeter({ password }) {
  const score = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) s++;
    if (password.length >= 12) s++;
    return s;
  }, [password]);

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-lime-500", "bg-green-500"];
  const textColors = ["", "text-red-600", "text-orange-600", "text-lime-600", "text-green-600"];

  return (
    <div className="mb-5">
      <div className="flex gap-1.5 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      {password && <p className={`text-xs font-medium ${textColors[score]}`}>{labels[score]}</p>}
    </div>
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tokenFromEmail = searchParams.get("token");

  const fromSettings = location.state?.fromSettings === true && !tokenFromEmail;
  const returnTo = location.state?.returnTo;

  const [tokenValid, setTokenValid] = useState(fromSettings ? true : null);
  const [validating, setValidating] = useState(Boolean(tokenFromEmail));
  const [tokenError, setTokenError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (fromSettings) return;

    if (!tokenFromEmail) {
      navigate("/forgot-password", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      setValidating(true);
      setTokenError("");
      try {
        await validatePasswordResetToken(tokenFromEmail);
        if (!cancelled) setTokenValid(true);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "This reset link is invalid or has expired.";
        if (!cancelled) {
          setTokenValid(false);
          setTokenError(message);
        }
      } finally {
        if (!cancelled) setValidating(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenFromEmail, fromSettings, navigate]);

  const requirements = useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { label: "One number or special character", met: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password) },
      { label: "Different from previous password", met: password.length > 0 },
    ],
    [password]
  );

  const passwordsMatch = password.length > 0 && password === confirm;
  const canSubmit = passwordsMatch && requirements.slice(0, 3).every((r) => r.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    if (fromSettings) {
      navigate("/password-reset-success", { state: { fromSettings, returnTo } });
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await completePasswordReset(tokenFromEmail, password);
      clearPasswordResetSession();
      navigate("/password-reset-success", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not reset password. Please request a new link.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <PasswordResetShell topbar={<PasswordResetTopbar backTo="/forgot-password" backLabel="← Back" />}>
        <p className="text-sm text-gray-500">Verifying your reset link…</p>
      </PasswordResetShell>
    );
  }

  if (tokenValid === false) {
    return (
      <PasswordResetShell topbar={<PasswordResetTopbar backTo="/forgot-password" backLabel="← Back" />}>
        <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md text-center">
          <p className="text-sm text-red-600 mb-6">{tokenError}</p>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="px-6 py-3 bg-navy text-white rounded-full text-sm font-medium hover:bg-navy/90"
          >
            Request a new link →
          </button>
        </div>
      </PasswordResetShell>
    );
  }

  return (
    <PasswordResetShell
      topbar={
        <PasswordResetTopbar
          backTo={fromSettings && returnTo ? returnTo : "/verify-code"}
          backLabel={fromSettings ? "← Back to Settings" : "← Back"}
        />
      }
    >
      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="#16a34a" strokeWidth="1.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-normal mb-3">Set a new password</h1>
      <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-8">
        {fromSettings
          ? "Create a new strong password for your account."
          : "Your identity has been verified. Create a new strong password for your account."}
      </p>

      <PasswordResetStepper current={3} />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md text-left"
      >
        <PasswordField label="New Password" value={password} onChange={setPassword} />
        <StrengthMeter password={password} />

        <PasswordField
          label="Confirm New Password"
          value={confirm}
          onChange={setConfirm}
          showMatch={passwordsMatch}
        />

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-gray-700 mb-3">Password requirements</p>
          <ul className="space-y-2">
            {requirements.map((req) => (
              <li key={req.label} className="flex items-center gap-2 text-sm text-gray-600">
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0
                    ${req.met ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-transparent"}`}
                >
                  ✓
                </span>
                {req.label}
              </li>
            ))}
          </ul>
        </div>

        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {submitError}
          </p>
        )}

        <GradientButton type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Resetting…" : "Reset Password →"}
        </GradientButton>
      </form>
    </PasswordResetShell>
  );
}
