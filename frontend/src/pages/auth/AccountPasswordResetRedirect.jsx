import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Handles backend-shaped reset links: /account/password/reset/:uidb64/:token
 */
export default function AccountPasswordResetRedirect() {
  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  useEffect(() => {
    if (!uidb64 || !token) {
      navigate("/forgot-password", { replace: true });
      return;
    }
    navigate(`/reset-password/${uidb64}/${encodeURIComponent(token)}`, { replace: true });
  }, [uidb64, token, navigate]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center font-sans">
      <p className="text-sm text-gray-500">Opening password reset…</p>
    </div>
  );
}
