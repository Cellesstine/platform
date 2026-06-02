import { useNavigate } from "react-router-dom";
import LinkioBrand from "../../../components/LinkioBrand";

export const CHANGE_PASSWORD_RETURN = {
  professional: "/professional/dashboard/settings",
  business: "/dashboard/settings",
};

/** Open set-new-password flow from Security settings (logged-in). */
export function goToChangePassword(navigate, portal) {
  navigate("/reset-password", {
    state: {
      fromSettings: true,
      returnTo: CHANGE_PASSWORD_RETURN[portal],
      portal: portal,
    },
  });
}

export function PasswordResetTopbar({ backTo = "/sign-in", backLabel = "← Back to Sign In" }) {
  const navigate = useNavigate();

  return (
    <div className="linkio-topbar">
      <LinkioBrand />
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        {backLabel}
      </button>
    </div>
  );
}

export function PasswordResetStepper({ current }) {
  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "Verification" },
    { n: 3, label: "New Password" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 mb-8 flex-wrap">
      {steps.map((step, i) => {
        const done = step.n < current;
        const active = step.n === current;
        const activeColor = "bg-[#4c0527] border-[#4c0527] text-white";

        return (
          <div key={step.label} className="flex items-center">
            {i > 0 && (
              <div className={`w-10 md:w-14 h-px mx-1 md:mx-2 ${done ? "bg-[#4c0527]" : "bg-gray-200"}`} />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border transition-all
                  ${done ? "bg-[#4c0527] border-[#4c0527] text-white" : ""}
                  ${active ? `${activeColor} text-white` : ""}
                  ${!done && !active ? "border-gray-200 text-gray-400 bg-white" : ""}
                `}
              >
                {done ? "✓" : step.n}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  active ? "text-gray-900 font-medium" : done ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GradientButton({ children, onClick, type = "button", disabled = false, className = "" }) {
  const hasBg = className.includes("bg-");
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3.5 rounded-linkio text-sm font-semibold text-white transition-all
        ${hasBg ? "" : "bg-[#4c0527] hover:bg-[#330319]"}
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function PasswordResetShell({ children, topbar }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">{children}</div>
    </div>
  );
}
