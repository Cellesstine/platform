import { useNavigate } from "react-router-dom";
import LinkioBrand from "../LinkioBrand";
import { getPortal } from "../../theme/portal";

/** Account / register split screen — same structure for business & professional. */
export default function PortalSplitLayout({ portal, leftContent, children, backTo }) {
  const navigate = useNavigate();
  const theme = getPortal(portal);

  return (
    <div className="min-h-screen flex flex-col bg-cream font-sans">
      <div className="linkio-topbar px-6 md:px-8">
        <LinkioBrand />
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="text-sm text-gray-500 hover:text-navy transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div
          className={`hidden lg:flex w-full lg:w-[42%] ${theme.panelClass} text-white flex-col justify-center px-12 xl:px-16 py-14`}
        >
          {leftContent}
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-10 lg:py-12">
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg">{children}</div>
        </div>
      </div>
    </div>
  );
}
