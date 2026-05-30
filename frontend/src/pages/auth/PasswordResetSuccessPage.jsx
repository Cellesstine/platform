import { useLocation, useNavigate } from "react-router-dom";
import { PasswordResetShell, PasswordResetTopbar, GradientButton } from "./passwordReset/shared";

export default function PasswordResetSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromSettings = location.state?.fromSettings === true;
  const returnTo = location.state?.returnTo;

  const backTarget = fromSettings && returnTo ? returnTo : "/sign-in";
  const backLabel = fromSettings ? "Back to Settings" : "Back to Sign In";

  return (
    <PasswordResetShell topbar={<PasswordResetTopbar backTo={backTarget} backLabel={backLabel} />}>
      <div className="flex flex-col items-center justify-center text-center max-w-md px-6">
        <div className="w-16 h-16 bg-[#4c0527]/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in">
          <svg className="w-8 h-8 text-[#4c0527]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-navy-deep font-normal mb-3 leading-snug">
          {fromSettings ? "Password Changed!" : "Password Reset!"}
        </h1>
        
        <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
          {fromSettings
            ? "Your password has been successfully updated."
            : "Your password has been successfully reset. You can now sign in to your account with your new password."}
        </p>

        <span className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-linkio mb-8 bg-[#4c0527]/5 text-[#4c0527]">
          🛡 All other sessions logged out
        </span>

        <GradientButton onClick={() => navigate(backTarget)} className="min-w-[16rem] mx-auto">
          {fromSettings ? "Back to Settings" : "Back to Sign In"}
        </GradientButton>
      </div>
    </PasswordResetShell>
  );
}
