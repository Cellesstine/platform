import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getEmailVerificationSession } from "../../services/emailVerificationApi";
import { signupVerifyConfirmPath } from "../../utils/accountEmailLinks";

/**
 * Handles backend-shaped signup links: /account/verify-email/:uidb64/:token
 * Redirects to the portal-specific confirm route that calls the API.
 */
export default function AccountVerifyEmailRedirect() {
  const navigate = useNavigate();
  const { uidb64, token } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!uidb64 || !token) {
      navigate("/sign-in", { replace: true });
      return;
    }

    let portal = searchParams.get("portal");
    if (portal !== "professional" && portal !== "business") {
      if (getEmailVerificationSession("professional")?.email) {
        portal = "professional";
      } else if (getEmailVerificationSession("business")?.email) {
        portal = "business";
      } else {
        portal = "business";
      }
    }

    navigate(signupVerifyConfirmPath(portal, uidb64, decodeURIComponent(token)), { replace: true });
  }, [uidb64, token, searchParams, navigate]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center font-sans">
      <p className="text-sm text-gray-500">Redirecting to email verification…</p>
    </div>
  );
}
