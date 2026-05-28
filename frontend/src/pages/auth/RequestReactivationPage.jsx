import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isValidEmail } from "../../utils/accountValidation";
import { requestReactivation } from "../../services/accountApi";
import { parseApiError } from "../../services/auth";
import LinkioBrand from "../../components/LinkioBrand";

export default function RequestReactivationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = isValidEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    try {
      await requestReactivation(email.trim());
      setSent(true);
    } catch (err) {
      setError(parseApiError(err, "Unable to send reactivation email."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans">
      <div className="linkio-topbar px-6 py-4 border-b border-ivory-deep flex justify-between items-center">
        <LinkioBrand />
        <button
          type="button"
          onClick={() => navigate("/sign-in")}
          className="text-sm text-gray-500 hover:text-navy"
        >
          ← Back to sign in
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <h1 className="font-serif text-3xl text-gray-900 font-normal mb-3 text-center">Reactivate your account</h1>
        <p className="text-sm text-gray-500 max-w-md text-center mb-8 leading-relaxed">
          If your account was deactivated, we&apos;ll send a reactivation link to your email. The link opens at{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">/account/reactivate/…</code> on this app.
        </p>

        {sent ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md text-center">
            <p className="text-sm text-gray-700">
              If an account exists for that email, a reactivation link has been sent. Check your inbox and spam folder.
            </p>
            <button
              type="button"
              onClick={() => navigate("/sign-in")}
              className="mt-6 text-navy font-semibold text-sm hover:underline"
            >
              Return to sign in →
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md text-left"
          >
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm mb-4 outline-none focus:border-navy focus:bg-white"
            />
            {error ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full py-3.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send reactivation link →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
