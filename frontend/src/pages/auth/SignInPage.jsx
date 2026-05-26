import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { canSubmitSignInForm } from "../../utils/accountValidation";
import { inputClass, FormDivider, OAuthButtons, PrimaryButton, PageTitle } from "../../components/ui";
import { getPortal } from "../../theme/portal";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = getPortal("business");

  const canSignIn = canSubmitSignInForm({ email, password });

  return (
    <AuthLayout leftContent={leftContent}>
      <PageTitle title="Good to have you back." subtitle="Enter your credentials to continue." />

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

      <PrimaryButton portal="business" disabled={!canSignIn} onClick={() => canSignIn && navigate("/dashboard")}>
        Sign in →
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
