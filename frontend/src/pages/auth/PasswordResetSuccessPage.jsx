import { useLocation, useNavigate } from "react-router-dom";
import { PasswordResetShell, PasswordResetTopbar, GradientButton } from "./passwordReset/shared";

export default function PasswordResetSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromSettings = location.state?.fromSettings === true;
  const returnTo = location.state?.returnTo;

  const backTarget = fromSettings && returnTo ? returnTo : "/sign-in";
  const backLabel = fromSettings ? "← Back to Settings" : "← Back to Sign In";

  return (
    <PasswordResetShell topbar={<PasswordResetTopbar backTo={backTarget} backLabel={backLabel} />}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-green-600 font-bold">✓</span>
        </div>

        <h1 className="font-serif text-3xl text-gray-900 font-normal mb-3">Password Reset!</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          {fromSettings
            ? "Your password has been successfully updated."
            : "Your password has been successfully reset. You can now sign in to your account with your new password."}
        </p>

        <GradientButton onClick={() => navigate(backTarget)}>
          {fromSettings ? "Back to Settings →" : "Back to Sign In →"}
        </GradientButton>

        <p className="text-xs text-gray-400 mt-6">For security, all other sessions have been logged out.</p>
      </div>
    </PasswordResetShell>
  );
}
