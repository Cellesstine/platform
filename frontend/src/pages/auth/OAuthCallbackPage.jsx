import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { storeAuthFromResponse, getDashboardPath } from "../../services/auth";
import { syncIndividualProfileId } from "../../services/applicationsApi";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    const role = searchParams.get("role");
    const needsProfileSetup = searchParams.get("needs_profile_setup") === "true";
    const email = searchParams.get("email");

    if (access && refresh && role && email) {
      const performAuth = async () => {
        try {
          storeAuthFromResponse({ access, refresh, role }, email);

          if (role === "individual") {
            if (!needsProfileSetup) {
              try {
                await syncIndividualProfileId();
              } catch (syncErr) {
                console.error("Failed to sync individual profile ID:", syncErr);
              }
            }
            const next = needsProfileSetup
              ? "/professional/onboarding/profile"
              : getDashboardPath("individual");
            navigate(next, { replace: true });
          } else {
            const next = needsProfileSetup
              ? "/onboarding/company"
              : getDashboardPath("enterprise");
            navigate(next, { replace: true });
          }
        } catch (err) {
          console.error("OAuth flow storage failed:", err);
          navigate("/sign-in?error=auth_storage_failed", { replace: true });
        }
      };

      performAuth();
    } else {
      const errorParam = searchParams.get("error") || "invalid_callback_params";
      navigate(`/sign-in?error=${errorParam}`, { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-linkio-lg border border-navy/10 p-8 shadow-sm max-w-md w-full text-center">
        <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="font-serif text-2xl text-navy-deep mb-2">Connecting account...</h2>
        <p className="text-sm text-gray-500">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
