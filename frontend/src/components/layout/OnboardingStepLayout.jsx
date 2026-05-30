import { useNavigate } from "react-router-dom";
import LinkioBrand from "../LinkioBrand";
import Stepper from "../Stepper";
import { getPortal } from "../../theme/portal";

/**
 * Steps 2+ onboarding (profile, company, documents) — uniform shell for both portals.
 */
export default function OnboardingStepLayout({
  portal,
  steps,
  current,
  children,
  maxWidth = "max-w-2xl",
  hideHeader = false,
}) {
  const navigate = useNavigate();
  const theme = getPortal(portal);

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      {!hideHeader && (
        <div className="linkio-topbar px-6 md:px-8">
          <LinkioBrand />
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-gray-500 hover:text-navy transition-colors"
          >
            ← Exit
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center px-6 py-8">
        <Stepper steps={steps} current={current} variant={theme.stepperVariant} />

        <div
          className={`linkio-panel w-full ${maxWidth} p-8 md:p-10 mt-6`}
        >
          {children}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 py-5">© 2026 Linkio. All rights reserved.</p>
    </div>
  );
}
