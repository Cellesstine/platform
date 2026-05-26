import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PortalSplitLayout from "../../components/layout/PortalSplitLayout";
import OnboardingStepLayout from "../../components/layout/OnboardingStepLayout";
import PendingStatusLayout from "../../components/layout/PendingStatusLayout";
import {
  Field,
  inputClass,
  PageTitle,
  FormDivider,
  OAuthButtons,
  AlertError,
  PrimaryButton,
} from "../../components/ui";
import { getPortal } from "../../theme/portal";
import { canSubmitAccountForm } from "../../utils/accountValidation";
import {
  sendSignupVerificationEmail,
  saveEmailVerificationSession,
  getEmailVerificationErrorMessage,
  isEmailVerified,
  getEmailVerificationSession,
} from "../../services/emailVerificationApi";

const Input = ({ label, placeholder, defaultValue, type = "text" }) => (
  <Field label={label} className="mb-4">
    <input type={type} placeholder={placeholder} defaultValue={defaultValue} className={inputClass} />
  </Field>
);

const bizBenefits = [
  "Post jobs across all 58 wilayas",
  "Browse verified professionals",
  "Commission freelancers directly",
  "Build a verified company presence",
];

export function OnboardingAccount() {
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

  const bizLeft = (
    <>
      <p className="text-[11px] tracking-widest text-white/50 uppercase mb-2">Business</p>
      <p className="text-[11px] tracking-widest text-gold-light uppercase mb-8">Step 1 of 3 — Account</p>
      <h2 className="font-serif text-4xl font-normal leading-snug mb-8">
        Find the talent <em className="italic">Algeria has to offer.</em>
      </h2>
      <ul className="flex flex-col gap-3">
        {bizBenefits.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm text-white/80">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs text-white flex-shrink-0">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </>
  );

  const theme = getPortal("business");

  return (
    <PortalSplitLayout portal="business" leftContent={bizLeft} backTo="/">
      <PageTitle title="Create your account" subtitle="Business credentials for Linkio." />

      <Field label="Business Email" className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.dz"
          className={inputClass}
        />
      </Field>
      <Field label="Password" className="mb-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a password"
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1.5">At least 8 characters</p>
      </Field>
      <Field label="Confirm Password" className="mb-4">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          className={inputClass}
        />
      </Field>

      <FormDivider />
      <OAuthButtons />
      <AlertError>{error}</AlertError>

      <label className="flex items-start gap-3 text-xs text-gray-500 mb-8 cursor-pointer leading-tight">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className={`w-4 h-4 mt-0.5 ${theme.checkbox}`}
        />
        <span>
          I agree to the <span className={`${theme.textAccent} font-semibold underline`}>Terms of Service</span> and{" "}
          <span className={`${theme.textAccent} font-semibold underline`}>Privacy Policy</span>
        </span>
      </label>

      <PrimaryButton portal="business" disabled={!canContinue} loading={loading} onClick={handleContinue}>
        Continue →
      </PrimaryButton>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account?{" "}
        <Link to="/sign-in" className={`${theme.textAccent} font-semibold hover:underline`}>
          Sign in
        </Link>
      </p>
    </PortalSplitLayout>
  );
}

// ── Step 2: Company ───────────────────────────────────────
export function OnboardingCompany() {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);

  useEffect(() => {
    if (!isEmailVerified("business")) {
      const session = getEmailVerificationSession("business");
      if (session?.email) {
        navigate("/verify-email", {
          replace: true,
          state: { email: session.email, expiresAt: session.expiresAt },
        });
      } else {
        navigate("/register", { replace: true });
      }
    }
  }, [navigate]);

  const handleLogoClick = () => {
    logoInputRef.current.click();
  };

  return (
    <OnboardingStepLayout portal="business" steps={["Account", "Company", "Documents"]} current={2}>
      <PageTitle title="Set up your company" subtitle="Tell professionals about your business." />

      <input
        type="file"
        ref={logoInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/svg+xml"
        onChange={(e) => console.log("Logo selected:", e.target.files[0])}
      />

        <div className="flex flex-col items-center mb-8">
          <div
            onClick={handleLogoClick}
            className="w-20 h-20 bg-ivory-warm border border-navy/10 rounded-linkio-lg flex flex-col items-center justify-center cursor-pointer hover:bg-ivory-deep transition-all group"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-[10px] text-gray-400 mt-1">Upload logo</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">PNG or SVG, max 2MB</p>
        </div>

        {/* باقي الحقول كما هي في تصميمك */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Company Name" placeholder="TechCorp Algérie SARL" />
          <Input label="Commercial Register No." placeholder="16B0000000" />
          <Input label="Industry" placeholder="Technology" />
          <Input label="Phone Number" placeholder="+213 21 XXX XXX" />
          <Input label="Wilaya" placeholder="Alger" />
          <Input label="Website" placeholder="https://yourcompany.dz" />
        </div>
        
        <div className="mt-4 mb-8">
          <Input label="Business Address" placeholder="Full address including street, city" />
        </div>

        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-900">← Back</button>
          <button type="button" onClick={() => navigate("/onboarding/documents")} className="btn-linkio-crimson px-10 py-3">
            Next →
          </button>
        </div>
    </OnboardingStepLayout>
  );
}

// ── Step 3: Documents ─────────────────────────────────────
export function OnboardingDocuments() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // 2. إنشاء المرجع

  const handleUploadClick = () => {
    fileInputRef.current.click(); // 3. وظيفة فتح نافذة الملفات
  };

  return (
    <OnboardingStepLayout portal="business" steps={["Account", "Company", "Documents"]} current={3} maxWidth="max-w-lg">
      <PageTitle
        title="Verification documents"
        subtitle="Upload official documents to verify your business identity."
      />

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => console.log(e.target.files[0])}
        accept=".pdf,image/*"
      />

      <div
        onClick={handleUploadClick}
        className="border-2 border-dashed border-navy/15 rounded-linkio-lg py-12 flex flex-col items-center gap-3 cursor-pointer hover:border-red/40 transition-all bg-ivory-warm mb-4"
      >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <p className="text-sm text-gray-500">Upload business verification documents</p>
          <span className="text-xs text-gray-400">Commercial register, tax ID — PDF or image</span>
        </div>

        <div className="bg-amber-light border border-amber/30 rounded-linkio px-4 py-3 flex gap-3 text-sm text-amber-900 mb-6">
          <span>⚠</span>
          <span>Your account must be <strong>verified by our admin team</strong> before you can post announcements. Verification takes 24–48 hours.</span>
        </div>

        <div className="flex justify-between">
          <button onClick={() => navigate("/onboarding/company")} className="text-sm text-gray-400 hover:text-gray-900">← Back</button>
          <button type="button" onClick={() => navigate("/onboarding/pending")} className="btn-linkio-crimson px-7 py-3">
            Submit →
          </button>
        </div>
    </OnboardingStepLayout>
  );
}

// ── Pending Verification ──────────────────────────────────
export function PendingVerificationPage() {
  const navigate = useNavigate();
  return (
    <PendingStatusLayout
      portal="business"
      title={
        <>
          Profile submitted —
          <br />
          pending verification
        </>
      }
      description="Our admin team will review your profile and documents within 24–48 hours. You'll receive an email once your account is verified."
      buttonLabel="Preview my profile →"
      onButton={() => navigate("/dashboard")}
    />
  );
}

