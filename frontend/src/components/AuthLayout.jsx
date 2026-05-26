import { useNavigate } from "react-router-dom";
import LinkioBrand from "./LinkioBrand";

export default function AuthLayout({ children, leftContent, leftBg = "linkio-gradient-panel" }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="linkio-topbar">
        <LinkioBrand />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-navy transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className={`w-full lg:w-[40%] ${leftBg} p-10 lg:p-16 flex flex-col justify-end text-white`}>
          {leftContent}
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
          <div className="w-full max-w-md mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
