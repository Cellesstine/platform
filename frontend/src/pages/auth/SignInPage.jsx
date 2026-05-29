import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { canSubmitSignInForm } from "../../utils/accountValidation";
import { inputClass, FormDivider, OAuthButtons, PrimaryButton, PageTitle } from "../../components/ui";
import { getPortal } from "../../theme/portal";
import { login as apiLogin } from "../../services/accountApi";
import { storeAuthFromResponse, parseApiError, getDashboardPath } from "../../services/auth";
import { syncIndividualProfileId } from "../../services/applicationsApi";

const leftContent = (
  <div>
    <p className="text-[11px] tracking-widest text-white/50 uppercase mb-2">Welcome back</p>
    <h2 className="font-serif text-4xl font-normal text-white leading-snug mb-6">
      Your network
      <br />
      is waiting
      <br />
      <em className="italic">for you.</em>
    </h2>
    <p className="text-sm text-white/70 leading-relaxed mb-8">
      Sign in to access your dashboard, track applications, manage job posts, and connect with talent across all 58
      wilayas.
    </p>
    <div className="flex gap-3">
      {[
        { n: "58", l: "Wilayas covered" },
        { n: "∞", l: "Job & freelance posts" },
        { n: "1st", l: "Verified DZ network" },
      ].map((s) => (
        <div key={s.l} className="flex-1 bg-white/10 rounded-linkio p-3">
          <p className="font-serif text-xl text-white">{s.n}</p>
          <p className="text-[11px] text-white/50 mt-1">{s.l}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inactiveEmail, setInactiveEmail] = useState(null);
  const theme = getPortal("business");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "authentication_failed") {
        setError("Google authentication failed. Please try again.");
      } else if (errorParam === "auth_storage_failed") {
        setError("An error occurred while saving your session. Please try again.");
      } else if (errorParam === "invalid_callback_params") {
        setError("Received invalid response from Google authentication. Please try again.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  }, [searchParams]);

  const successMessage = location.state?.message;
  const reactivated = location.state?.reactivated;

  const canSignIn = canSubmitSignInForm({ email, password });

  const handleSignIn = async () => {
    if (!canSignIn || loading) return;

    setLoading(true);
    setError("");
    setInactiveEmail(null);
    try {
      const trimmedEmail = email.trim();
      const data = await apiLogin({ email: trimmedEmail, password });

      storeAuthFromResponse(data, trimmedEmail);

      if (data?.role === "individual") {
        if (!data?.needs_profile_setup) {
          await syncIndividualProfileId();
        }
        const next =
          searchParams.get("next") ||
          location.state?.from ||
          (data?.needs_profile_setup ? "/professional/onboarding/profile" : getDashboardPath("individual"));
        navigate(next, { replace: true });
        return;
      }

      const next =
        searchParams.get("next") ||
        location.state?.from ||
        (data?.needs_profile_setup ? "/onboarding/company" : getDashboardPath("enterprise"));
      navigate(next, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.inactive) {
        setInactiveEmail(data.email || email.trim());
        setError(
          "This account is inactive. If you deactivated it, request a reactivation link. If you never verified your email after signing up, check your inbox for the verification email."
        );
        return;
      }
      setError(parseApiError(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout leftContent={leftContent}>
      <PageTitle title="Good to have you back." subtitle="Enter your credentials to continue." />

      {reactivated || successMessage ? (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-4">
          {successMessage || "Account reactivated. Sign in to continue."}
        </p>
      ) : null}

      <label className="block text-sm font-medium text-navy-deep mb-1">Email Address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`${inputClass} mb-4`}
        placeholder="you@example.com"
      />

      <label className="block text-sm font-medium text-navy-deep mb-1">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`${inputClass} mb-1`}
        placeholder="Your password"
      />
      <p className="text-xs text-gray-500 mb-3">At least 8 characters</p>

      <div className="flex justify-between items-center mb-5">
        <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
          <input type="checkbox" className={theme.checkbox} /> Remember me
        </label>
        <button
          type="button"
          className={`text-sm ${theme.textAccent} underline`}
          onClick={() => navigate("/forgot-password")}
        >
          Forgot password?
        </button>
      </div>

      <FormDivider />
      <OAuthButtons />
      {error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4 space-y-3">
          <p>{error}</p>
          {inactiveEmail ? (
            <button
              type="button"
              className="text-navy font-semibold underline"
              onClick={() =>
                navigate("/request-reactivation", { state: { email: inactiveEmail } })
              }
            >
              Request reactivation email →
            </button>
          ) : null}
        </div>
      ) : null}

      <PrimaryButton portal="business" disabled={!canSignIn || loading} loading={loading} onClick={handleSignIn}>
        {loading ? "Signing in…" : "Sign in →"}
      </PrimaryButton>

      <p className="text-sm text-gray-500 text-center mt-4">
        Don&apos;t have an account?{" "}
        <Link to="/" className={`${theme.textAccent} underline`}>
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
