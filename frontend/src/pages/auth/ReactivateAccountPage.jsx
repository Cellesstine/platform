import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reactivateAccount } from "../../services/accountApi";
import { parseApiError } from "../../services/auth";
import LinkioBrand from "../../components/LinkioBrand";

/**
 * Handles backend-shaped reactivation links: /account/reactivate/:uidb64/:token
 */
export default function ReactivateAccountPage() {
  const navigate = useNavigate();
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uidb64 || !token) {
      setStatus("error");
      setError("Invalid reactivation link.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await reactivateAccount(uidb64, decodeURIComponent(token));
        if (cancelled) return;
        setStatus("success");
        setTimeout(() => {
          navigate("/sign-in", {
            replace: true,
            state: { reactivated: true, message: "Account reactivated. Sign in with your password to continue." },
          });
        }, 1500);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(parseApiError(err, "This reactivation link is invalid or has expired."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uidb64, token, navigate]);

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <div className="linkio-topbar px-6 py-4 border-b border-ivory-deep">
        <LinkioBrand />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {status === "loading" && <p className="text-sm text-gray-500">Reactivating your account…</p>}
        {status === "success" && (
          <div className="bg-white rounded-2xl border border-green-100 p-8 max-w-md shadow-sm">
            <p className="text-sm text-green-700 font-medium">Account reactivated successfully.</p>
            <p className="text-xs text-gray-500 mt-2">Redirecting you now…</p>
          </div>
        )}
        {status === "error" && (
          <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md shadow-sm">
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/sign-in")}
              className="px-6 py-3 bg-navy text-white rounded-full text-sm font-medium hover:bg-navy/90"
            >
              Back to sign in →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
