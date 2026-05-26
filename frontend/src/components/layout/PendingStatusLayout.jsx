import { useNavigate } from "react-router-dom";
import LinkioBrand from "../LinkioBrand";
import { getPortal } from "../../theme/portal";

export default function PendingStatusLayout({
  portal,
  title,
  description,
  buttonLabel,
  onButton,
}) {
  const navigate = useNavigate();
  const theme = getPortal(portal);

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <div className="linkio-topbar px-6 md:px-8">
        <LinkioBrand />
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm text-gray-500 hover:text-navy transition-colors"
        >
          ← Home
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className={`w-16 h-16 ${theme.iconBg} rounded-full flex items-center justify-center text-2xl mb-6`}>
          🕐
        </div>
        <h1 className="font-serif text-3xl text-navy-deep font-normal mb-3 leading-snug">{title}</h1>
        <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">{description}</p>
        <span
          className={`inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-linkio mb-8 ${theme.badgePending}`}
        >
          ⏱ Verification in progress
        </span>
        <button type="button" onClick={onButton} className={`${theme.primaryBtn} min-w-[16rem]`}>
          {buttonLabel}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 py-5">© 2026 Linkio. All rights reserved.</p>
    </div>
  );
}
