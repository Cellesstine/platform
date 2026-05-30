import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyEmailChange } from "../../services/accountApi";
import { parseApiError, getUserRole } from "../../services/auth";
import LinkioBrand from "../../components/LinkioBrand";

/**
 * Handles backend-shaped email-change links: /account/email/verify/:uidb64/:token
 */
export default function EmailChangeVerifyPage() {
  const navigate = useNavigate();
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uidb64 || !token) {
      setStatus("error");
      setError("Invalid verification link.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await verifyEmailChange(uidb64, decodeURIComponent(token));
        if (cancelled) return;
        setMessage(data?.detail || "Email address updated successfully.");
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(parseApiError(err, "This verification link is invalid or has expired."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uidb64, token]);

  const settingsPath =
    getUserRole() === "individual" ? "/professional/dashboard/settings" : "/dashboard/settings";

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <div className="linkio-topbar px-6 py-4 border-b border-ivory-deep">
        <LinkioBrand />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {status === "loading" && <p className="text-sm text-gray-500">Confirming your new email…</p>}
        {status === "success" && (
          <div className="bg-white rounded-2xl border border-green-100 p-8 max-w-md shadow-sm">
            <p className="text-sm text-green-700 font-medium">{message}</p>
            <button
              type="button"
              onClick={() => navigate(settingsPath, { replace: true })}
              className="mt-6 px-6 py-3 bg-navy text-white rounded-full text-sm font-medium hover:bg-navy/90"
            >
              Go to settings →
            </button>
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
              Sign in →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
