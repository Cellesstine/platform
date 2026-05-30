import { getPortal } from "../../theme/portal";

/** Account / register split screen — same structure for business & professional. */
export default function PortalSplitLayout({ portal, leftContent, children }) {
  const theme = getPortal(portal);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream font-sans">
      {/* Left Column */}
      <div
        className={`hidden lg:flex w-full lg:w-[40%] ${theme.panelClass} text-white flex-col justify-center px-12 xl:px-16 py-14`}
      >
        {leftContent}
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-10 lg:py-12">
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg">{children}</div>
      </div>
    </div>
  );
}

