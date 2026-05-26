import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { canSubmitAccountForm } from "../../utils/accountValidation";
import { inputClass, FormDivider, OAuthButtons, AlertError, PrimaryButton, PageTitle } from "../../components/ui";
import { getPortal } from "../../theme/portal";
import {
  sendSignupVerificationEmail,
  saveEmailVerificationSession,
  getEmailVerificationErrorMessage,
} from "../../services/emailVerificationApi";

const leftContent = (
  <div>
    <p className="text-[11px] tracking-widest text-white/50 uppercase mb-2">BUSINESS</p>
    <p className="text-xs text-white/50 mb-5">STEP 1 OF 3 — ACCOUNT</p>
    <h2 className="font-serif text-4xl font-normal text-white leading-snug mb-8">
      Find the talent<br /><em>Algeria has to offer.</em>
    </h2>
    <ul className="flex flex-col gap-3">
      {/* ✅ تحديث الولايات إلى 69 */}
      {["Post jobs across all 69 wilayas", "Browse verified professionals", "Commission freelancers directly", "Build a verified company presence"].map((item) => (
        <li key={item} className="flex items-center gap-3 text-sm text-white/80">
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs text-white flex-shrink-0">✓</span>
          {item}
        </li>
      ))}
    </ul>
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

  const canContinue = canSubmitAccountForm({
    email,
    password,
    confirmPassword,
    agreedToTerms,
  });

  const handleContinue = async () => {
    if (!canContinue || loading) return;
    const trimmed = email.trim();
    setLoading(true);
    setError("");
    try {
      await sendSignupVerificationEmail("business", trimmed);
      const expiresAt = saveEmailVerificationSession("business", trimmed);
      navigate("/verify-email", { state: { email: trimmed, expiresAt } });
    } catch (err) {
      setError(getEmailVerificationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout leftContent={leftContent} leftBg="bg-red">
      <PageTitle title="Create your account" subtitle="Business credentials for Linkio." />

      <label className="block text-sm font-medium text-navy-deep mb-1">Business Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`${inputClass} mb-4`}
        placeholder="you@company.dz"
      />

      <label className="block text-sm font-medium text-navy-deep mb-1">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`${inputClass} mb-1`}
        placeholder="Enter a password"
      />
      <p className="text-xs text-gray-500 mb-4">At least 8 characters</p>

      <label className="block text-sm font-medium text-navy-deep mb-1">Confirm Password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className={`${inputClass} mb-5`}
        placeholder="Repeat your password"
      />

      <FormDivider />
      <OAuthButtons />
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