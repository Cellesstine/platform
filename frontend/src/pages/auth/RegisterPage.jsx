import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { inputClass, AlertError, PrimaryButton, PageTitle, Field } from "../../components/ui";
import { getPortal } from "../../theme/portal";
import { saveEmailVerificationSession } from "../../services/emailVerificationApi";
import { register as apiRegister } from "../../services/accountApi";
import { parseApiError } from "../../services/auth";

const leftContent = (
  <div className="text-left flex flex-col items-start justify-center w-full max-w-sm mx-auto">
    <p className="text-[10px] tracking-[0.2em] text-white/60 uppercase mb-2">BUSINESS</p>
    <h2 className="font-serif text-3xl font-normal text-white leading-snug mb-6 italic">
      Acquire elite talent.<br />Scale your enterprise.
    </h2>
    <p className="text-sm text-white/70 leading-relaxed font-light">
      Build a verified presence to hire Algerian professionals, post jobs, and contract specialists directly.
    </p>
  </div>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const canContinue = email.trim() !== "" && password !== "" && confirmPassword !== "" && agreedToTerms;

  const handleContinue = async () => {
    if (!canContinue || loading) return;
    const trimmed = email.trim();
    setLoading(true);
    setError("");
    setFieldErrors({});
    try {
      await apiRegister({
        email: trimmed,
        password,
        password_confirm: confirmPassword,
        role: "enterprise",
      });
      const expiresAt = saveEmailVerificationSession("business", trimmed);
      navigate("/verify-email", { state: { email: trimmed, expiresAt } });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setFieldErrors(data);
        if (data.non_field_errors) {
          setError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
        } else if (data.detail) {
          setError(data.detail);
        }
      } else {
        setError(parseApiError(err, "Unable to create your account. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout leftContent={leftContent} leftBg="bg-red">
      <PageTitle title="Create your account" subtitle={<em className="italic">Provide your business credentials.</em>} />

      {/* Sleek Floating Switcher Cards inside a rounded-rectangle wrapper */}
      <div className="bg-white/95 border border-gray-150 p-2 rounded-[24px] shadow-[0_16px_36px_rgba(127,29,29,0.12)] w-full max-w-xs mx-auto mb-8 select-none flex gap-2 hover:shadow-[0_20px_44px_rgba(127,29,29,0.16)] transition-all duration-300">
        {/* Professional Switch Card */}
        <button
          type="button"
          onClick={() => navigate("/professional/onboarding/account")}
          className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-[16px] cursor-pointer transition-all duration-300 border border-transparent text-gray-400 hover:border-navy hover:text-navy hover:bg-navy/[0.02]"
        >
          Professional
        </button>

        {/* Business Switch Card */}
        <button
          type="button"
          className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-[16px] cursor-default transition-all duration-300 border border-red bg-red text-white shadow-[0_4px_12px_rgba(127,29,29,0.2)] scale-[1.02] text-center"
        >
          Business
        </button>
      </div>

      <Field label="Business Email" className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
          }}
          className={inputClass}
          placeholder="you@company.dz"
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-600 mt-1 font-medium select-none animate-fade-in">
            {Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}
          </p>
        )}
      </Field>

      <Field label="Password" className="mb-4">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
          }}
          className={inputClass}
          placeholder="Enter a password"
        />
        {fieldErrors.password && (
          <p className="text-xs text-red-600 mt-1 font-medium select-none animate-fade-in">
            {Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
          </p>
        )}
      </Field>

      <Field label="Confirm Password" className="mb-4">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.password_confirm) setFieldErrors({ ...fieldErrors, password_confirm: null });
          }}
          className={inputClass}
          placeholder="Confirm password"
        />
        {fieldErrors.password_confirm && (
          <p className="text-xs text-red-600 mt-1 font-medium select-none animate-fade-in">
            {Array.isArray(fieldErrors.password_confirm) ? fieldErrors.password_confirm[0] : fieldErrors.password_confirm}
          </p>
        )}
      </Field>

      <AlertError>{error}</AlertError>

      <label className="flex items-center gap-2 text-sm text-gray-500 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className={`w-4 h-4 ${getPortal("business").checkbox}`}
        />
        <span>
          I agree to the <span className="text-red underline">Terms of Service</span> and{" "}
          <span className="text-red underline">Privacy Policy</span>
        </span>
      </label>

      <PrimaryButton portal="business" disabled={!canContinue} loading={loading} onClick={handleContinue}>
        Continue →
      </PrimaryButton>

      <p className="text-sm text-gray-500 text-center mt-4">
        Already have an account?{" "}
        <Link to="/sign-in" className="text-red font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}