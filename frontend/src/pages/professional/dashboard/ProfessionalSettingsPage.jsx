import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toggle, Modal } from "../../../components/ui";
import { goToChangePassword } from "../../auth/passwordReset/shared";
import { deactivateAccount, deleteAccount, logout, changeEmail } from "../../../services/accountApi";
import { clearAuth, getUserEmail, parseApiError } from "../../../services/auth";

const settingsNav = [
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "preferences", label: "Preferences" },
];

export default function ProfessionalSettingsPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState("security");
  const [notifs, setNotifs] = useState([true, true, false, false]);
  const [privacy, setPrivacy] = useState([true, false, true, false]);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [emailChangeSuccess, setEmailChangeSuccess] = useState("");

  const userEmail = getUserEmail();

  const handleLogout = async () => {
    await logout();
    clearAuth();
    navigate("/sign-in", { replace: true });
  };

  const handleDeactivate = async () => {
    if (!deactivatePassword) return;
    setAccountLoading(true);
    setAccountError("");
    try {
      await deactivateAccount(deactivatePassword);
      await logout();
      clearAuth();
      navigate("/sign-in", {
        replace: true,
        state: { message: "Account deactivated. Request reactivation to sign in again." },
      });
    } catch (err) {
      setAccountError(parseApiError(err, "Unable to deactivate account."));
    } finally {
      setAccountLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePassword || deleteConfirm !== "YACINE" || !deleteChecked) return;
    setAccountLoading(true);
    setAccountError("");
    try {
      await deleteAccount(deletePassword);
      clearAuth();
      navigate("/", { replace: true });
    } catch (err) {
      setAccountError(parseApiError(err, "Unable to delete account."));
    } finally {
      setAccountLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setAccountLoading(true);
    setAccountError("");
    try {
      await changeEmail({ new_email: newEmail.trim(), password: emailChangePassword || undefined });
      setShowChangeEmail(false);
      setNewEmail("");
      setEmailChangePassword("");
      setEmailChangeSuccess(
        "Verification email sent. Open the link at /account/email/verify/… on this app (not the API host)."
      );
    } catch (err) {
      setAccountError(parseApiError(err, "Unable to change email."));
    } finally {
      setAccountLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy font-normal mb-8">Settings</h1>
      {emailChangeSuccess ? (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-6">
          {emailChangeSuccess}
        </p>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="w-full lg:w-48 flex-shrink-0 space-y-1">
          {settingsNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                section === item.id ? "bg-pro-blue text-navy font-medium" : "text-gray-600 hover:bg-white"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-4"
          >
            ← Log out
          </button>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            ✕ Delete Account
          </button>
        </nav>

        <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm min-h-[400px]">
          {section === "security" && (
            <>
              <h2 className="font-semibold text-lg mb-6">Security</h2>
              {[
                {
                  label: "Password",
                  desc: "Last changed 3 months ago",
                  status: "Strong",
                  statusColor: "text-green-700 bg-green-50",
                  action: "Change",
                  onAction: () => goToChangePassword(navigate, "professional"),
                },
                { label: "Two-factor authentication", desc: "Add an extra layer of security", status: "Not enabled", statusColor: "text-amber-700 bg-amber-50", action: "Enable" },
                {
                  label: "Email address",
                  desc: userEmail || "—",
                  status: "Verified",
                  statusColor: "text-green-700 bg-green-50",
                  action: "Change",
                  onAction: () => setShowChangeEmail(true),
                },
                { label: "Connected accounts", desc: "Google, Apple", status: null, action: "Manage" },
                { label: "Active sessions", desc: "2 devices currently signed in", status: null, action: "Sign out all", danger: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{row.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {row.status && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${row.statusColor}`}>{row.status}</span>
                    )}
                    <button
                      type="button"
                      onClick={row.onAction}
                      className={`text-sm font-medium ${row.danger ? "text-red-600 border border-red-200 px-3 py-1 rounded-lg" : "text-navy hover:underline"}`}
                    >
                      {row.action}
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-6 bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500">
                Recent login: Today at 10:24 AM · Chrome · Alger, Algeria
              </div>
            </>
          )}

          {section === "notifications" && (
            <>
              <h2 className="font-semibold text-lg mb-6">Notifications</h2>
              {[
                { label: "New job announcements", desc: "Get notified of relevant new jobs." },
                { label: "Business offers", desc: "Receive direct offers from companies." },
                { label: "Email digests", desc: "Weekly summary of activity." },
                { label: "Profile views", desc: "When a business views your profile." },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <Toggle on={notifs[i]} onChange={(v) => { const n = [...notifs]; n[i] = v; setNotifs(n); }} />
                </div>
              ))}
            </>
          )}

          {section === "privacy" && (
            <>
              <h2 className="font-semibold text-lg mb-1">Privacy</h2>
              <p className="text-sm text-gray-400 mb-6">Profile Visibility</p>
              {[
                { label: "Show profile to businesses", desc: "Your profile appears in search results for companies." },
                { label: "Show phone number", desc: "Verified businesses can see your phone number." },
                { label: "Profile view notifications", desc: "Know when a business looks at your profile." },
                { label: "Analytics & usage data", desc: "Help us improve by sharing anonymous usage data." },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <Toggle on={privacy[i]} onChange={(v) => { const p = [...privacy]; p[i] = v; setPrivacy(p); }} />
                </div>
              ))}
            </>
          )}

          {section === "preferences" && (
            <>
              <h2 className="font-semibold text-lg mb-6">Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium block mb-2">Language</label>
                  <select className="w-full max-w-xs px-4 py-3 rounded-xl bg-gray-50 text-sm outline-none">
                    <option>English</option>
                    <option>Français</option>
                    <option>العربية</option>
                  </select>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-sm mb-2">Deactivate Account</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Temporarily hide your profile from employers. You can reactivate anytime by signing back in.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeactivate(true)}
                    className="px-4 py-2 border border-amber/40 text-amber-800 rounded-xl text-sm hover:bg-amber-light"
                  >
                    Deactivate account
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Deactivate modal */}
      <Modal open={showDeactivate} onClose={() => setShowDeactivate(false)} className="max-w-md">
        <div className="bg-amber-light rounded-t-2xl px-6 py-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center text-amber-800 text-lg flex-shrink-0">
            !
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 text-lg">Deactivate your account?</h3>
            <p className="text-sm text-amber-800/80 mt-1">Your profile will be hidden until you reactivate.</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">While your account is deactivated:</p>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
            {[
              { ok: false, text: "Your profile won't appear in employer searches" },
              { ok: false, text: "Pending applications will be paused (companies are notified)" },
              { ok: true, text: "Your CV, profile, and application history are kept safe" },
              { ok: true, text: "Reactivate instantly at any time by signing back in" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-2">
                <span className={item.ok ? "text-green-600" : "text-amber-600"}>{item.ok ? "✓" : "−"}</span>
                {item.text}
              </li>
            ))}
          </ul>
          <label className="text-xs text-gray-500 block mb-2">Reason for deactivating (optional)</label>
          <select
            value={deactivateReason}
            onChange={(e) => setDeactivateReason(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm mb-4 outline-none"
          >
            <option value="">Select a reason...</option>
            <option>Taking a break</option>
            <option>Found a job elsewhere</option>
            <option>Privacy concerns</option>
            <option>Other</option>
          </select>
          <label className="text-xs text-gray-500 block mb-2">Confirm with your password</label>
          <input
            type="password"
            value={deactivatePassword}
            onChange={(e) => setDeactivatePassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm mb-4 outline-none"
          />
          {accountError ? <p className="text-sm text-red-600 mb-4">{accountError}</p> : null}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeactivate(false)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!deactivatePassword || accountLoading}
              onClick={handleDeactivate}
              className="flex-1 py-3 bg-amber text-white rounded-xl text-sm font-medium hover:bg-amber/90 disabled:opacity-50"
            >
              {accountLoading ? "Deactivating…" : "Yes, Deactivate"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete account modal */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} className="max-w-lg">
        <div className="px-6 py-5 border-b border-red-100">
          <div className="flex gap-3 items-start text-red-700">
            <span className="text-xl">⚠</span>
            <div>
              <h3 className="font-semibold text-lg">Delete your account?</h3>
              <p className="text-sm text-red-600/80 mt-1">This action is permanent and cannot be undone.</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account will <strong>permanently remove</strong> all of the following:
          </p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-gray-700 space-y-2">
            <p>• Your profile and public presence</p>
            <p>• All application history</p>
            <p>• Saved jobs and preferences</p>
            <p>• Connected account data</p>
          </div>
          <label className="text-xs text-gray-500 block mb-2">Your password</label>
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm mb-4 outline-none focus:border-red-300"
          />
          <label className="text-xs text-gray-500 block mb-2">To confirm, type YACINE below</label>
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type YACINE to confirm"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm mb-4 outline-none focus:border-red-300"
          />
          <label className="flex items-start gap-3 text-xs text-gray-600 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={deleteChecked}
              onChange={(e) => setDeleteChecked(e.target.checked)}
              className="mt-0.5"
            />
            I understand that this action is <strong>irreversible</strong> and all data will be permanently deleted.
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowDelete(false)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteConfirm !== "YACINE" || !deleteChecked || !deletePassword || accountLoading}
              onClick={handleDelete}
              className="flex-1 py-3 bg-red-400 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500"
            >
              {accountLoading ? "Deleting…" : "Delete Account Permanently"}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">You will receive a confirmation email at yacine.benali@example.com</p>
        </div>
      </Modal>

      <Modal open={showChangeEmail} onClose={() => setShowChangeEmail(false)} className="max-w-md">
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2">Change email address</h3>
          <p className="text-sm text-gray-500 mb-4">
            We&apos;ll send a verification link to your new email at{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">/account/email/verify/…</code>.
          </p>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm mb-4 outline-none"
          />
          <input
            type="password"
            value={emailChangePassword}
            onChange={(e) => setEmailChangePassword(e.target.value)}
            placeholder="Current password"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm mb-4 outline-none"
          />
          {accountError ? <p className="text-sm text-red-600 mb-4">{accountError}</p> : null}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowChangeEmail(false)} className="flex-1 py-3 border rounded-xl text-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={!newEmail.trim() || accountLoading}
              onClick={handleChangeEmail}
              className="flex-1 py-3 bg-navy text-white rounded-xl text-sm disabled:opacity-50"
            >
              {accountLoading ? "Sending…" : "Send verification"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
