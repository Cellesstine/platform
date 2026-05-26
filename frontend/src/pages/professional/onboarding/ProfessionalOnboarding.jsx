import { useRef, useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import PortalSplitLayout from "../../../components/layout/PortalSplitLayout";
import OnboardingStepLayout from "../../../components/layout/OnboardingStepLayout";
import PendingStatusLayout from "../../../components/layout/PendingStatusLayout";
import {
  Field,
  inputClass,
  PageTitle,
  FormDivider,
  OAuthButtons,
  AlertError,
  PrimaryButton,
} from "../../../components/ui";
import { getPortal } from "../../../theme/portal";
import { canSubmitAccountForm } from "../../../utils/accountValidation";
import EmailVerificationPending from "../../../components/EmailVerificationPending";
import {
  sendSignupVerificationEmail,
  saveEmailVerificationSession,
  getEmailVerificationErrorMessage,
  isEmailVerified,
  getEmailVerificationSession,
} from "../../../services/emailVerificationApi";

const profBenefits = [
  "Build a verified skill profile",
  "Apply to jobs across 69 wilayas",
  "Receive freelance requests directly",
  "One profile — employee and freelancer",
];

export function ProfessionalAccountPage() {
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
      await sendSignupVerificationEmail("professional", trimmed);
      const expiresAt = saveEmailVerificationSession("professional", trimmed);
      navigate("/professional/onboarding/verify-email", {
        state: { email: trimmed, expiresAt },
      });
    } catch (err) {
      setError(getEmailVerificationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const profLeft = (
    <>
      <p className="text-[11px] tracking-widest text-white/50 uppercase mb-1">Professional</p>
      <p className="text-[11px] tracking-widest text-gold-light uppercase mb-8">Step 1 of 3 — Account</p>
      <h2 className="font-serif text-4xl font-normal leading-snug mb-10">
        Your next opportunity starts here.
      </h2>
      <ul className="space-y-4">
        {profBenefits.map((b) => (
          <li key={b} className="flex items-start gap-3 text-sm text-white/90">
            <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-gold-light text-xs flex-shrink-0 mt-0.5">
              ✓
            </span>
            {b}
          </li>
        ))}
      </ul>
    </>
  );

  const theme = getPortal("professional");

  return (
    <PortalSplitLayout portal="professional" leftContent={profLeft} backTo="/">
      <PageTitle title="Create your account" subtitle="Your login credentials for Linkio." />

      <Field label="Email Address" className="mb-4">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Password" className="mb-4">
        <input
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1.5">At least 8 characters</p>
      </Field>
      <Field label="Confirm Password" className="mb-4">
        <input
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
        />
      </Field>

      <FormDivider />
      <OAuthButtons />

      <AlertError>{error}</AlertError>

      <label className="flex items-start gap-3 text-xs text-gray-500 mb-8 cursor-pointer">
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

      <PrimaryButton
        portal="professional"
        disabled={!canContinue}
        loading={loading}
        onClick={handleContinue}
      >
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

export function ProfessionalVerifyEmailPage() {
  return <EmailVerificationPending portal="professional" />;
}

export function ProfessionalProfileSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [skills, setSkills] = useState(["JavaScript", "React", "Node.js"]);
  const photoRef = useRef(null);

  const removeSkill = (s) => setSkills((prev) => prev.filter((x) => x !== s));

  useEffect(() => {
    if (!isEmailVerified("professional")) {
      const session = getEmailVerificationSession("professional");
      if (session?.email) {
        navigate("/professional/onboarding/verify-email", {
          replace: true,
          state: { email: session.email, expiresAt: session.expiresAt },
        });
      } else {
        navigate("/professional/onboarding/account", { replace: true });
      }
    }
  }, [navigate]);

  const theme = getPortal("professional");

  return (
    <OnboardingStepLayout portal="professional" steps={["Account", "Profile", "Documents"]} current={2}>
      <PageTitle
        title="Set up your profile"
        subtitle="This information will be visible to businesses on the platform."
      />

          <div className="flex flex-col items-center mb-8">
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-navy hover:text-navy transition-colors"
            >
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs">Upload photo</span>
            </button>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png" className="hidden" />
            <p className="text-xs text-gray-400 mt-2">JPG or PNG, max 2MB</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name">
              <input placeholder="Yacine" className={inputClass} />
            </Field>
            <Field label="Last Name">
              <input placeholder="Benali" className={inputClass} />
            </Field>
            <Field label="Phone Number">
              <input placeholder="+213 6XX XXX XXX" className={inputClass} />
            </Field>
            <Field label="Wilaya">
              <input placeholder="Alger" className={inputClass} />
            </Field>
            <Field label="City">
              <input placeholder="Your city" className={inputClass} />
            </Field>
            <Field label="Years of Experience">
              <input placeholder="3" type="number" className={inputClass} />
            </Field>
            <Field label="Job Title" className="md:col-span-2">
              <input placeholder="e.g. Software Engineer" className={inputClass} />
            </Field>
          </div>

          <Field label="Skills" className="mt-4">
            <div className={`${inputClass} flex flex-wrap gap-2 items-center min-h-[48px]`}>
              {skills.map((s) => (
                <span key={s} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-linkio ${theme.skillTag}`}>
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="text-navy/60 hover:text-navy">
                    ×
                  </button>
                </span>
              ))}
              <span className="text-xs text-gray-400">+ Add skill</span>
            </div>
          </Field>

          <Field label="About Me" className="mt-4">
            <textarea
              rows={4}
              placeholder="Tell businesses what makes you stand out..."
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() =>
                navigate("/professional/onboarding/verify-email", { state: email ? { email } : undefined })
              }
              className="text-sm text-gray-400 hover:text-gray-900"
            >
              ← Back
            </button>
            <button type="button" onClick={() => navigate("/professional/onboarding/documents")} className="btn-linkio-navy px-10 py-3">
              Next →
            </button>
          </div>
    </OnboardingStepLayout>
  );
}

export function ProfessionalDocumentsPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  return (
    <OnboardingStepLayout portal="professional" steps={["Account", "Profile", "Documents"]} current={3} maxWidth="max-w-lg">
      <PageTitle
        title="Upload your CV"
        subtitle="Your CV will be attached to your applications. Businesses will see it when you apply."
      />

      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={() => {}} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-navy/15 rounded-linkio-lg py-14 flex flex-col items-center gap-2 hover:border-navy/40 transition-colors mb-4 bg-ivory-warm"
      >
            <span className="text-3xl text-gray-300">📄</span>
            <p className="text-sm font-medium text-gray-700">Upload your CV</p>
            <p className="text-sm text-gray-500">
              Drag & drop your file here, or <span className="text-navy font-medium">browse to upload</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF · DOCX · DOC accepted</p>
            <p className="text-xs text-gray-400">Maximum file size: 5 MB</p>
          </button>

          <div className="bg-amber-light border border-amber/20 rounded-xl px-4 py-3 text-sm text-amber-900 mb-8">
            Your account will need to be <strong>verified by an admin</strong> before you can apply to jobs.
            You&apos;ll receive an email once approved.
          </div>

          <div className="flex justify-between items-center">
            <button type="button" onClick={() => navigate("/professional/onboarding/profile")} className="text-sm text-gray-400 hover:text-gray-900">
              ← Back
            </button>
            <button type="button" onClick={() => navigate("/professional/onboarding/pending")} className="btn-linkio-navy px-8 py-3">
              Submit Profile →
            </button>
          </div>
    </OnboardingStepLayout>
  );
}

export function ProfessionalPendingPage() {
  const navigate = useNavigate();

  return (
    <PendingStatusLayout
      portal="professional"
      title={
        <>
          Profile submitted —
          <br />
          pending verification
        </>
      }
      description="Our admin team will review your profile and documents within 24–48 hours. You'll receive an email once your account is verified."
      buttonLabel="Go to dashboard →"
      onButton={() => navigate("/professional/dashboard")}
    />
  );
}
