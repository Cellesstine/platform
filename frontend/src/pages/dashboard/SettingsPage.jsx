import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toggle, Modal } from "../../components/ui";
import { goToChangePassword } from "../auth/passwordReset/shared";

const settingsNav = [
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "preferences", label: "Preferences" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState("security");
  const [notifs, setNotifs] = useState([true, true, false, true]);
  const [privacy, setPrivacy] = useState([true, true, false, false]);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteChecked, setDeleteChecked] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy font-normal mb-8">Settings</h1>

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
            onClick={() => navigate("/sign-in")}
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
                  onAction: () => goToChangePassword(navigate, "business"),
                },
                {
                  label: "Two-factor authentication",
                  desc: "Add an extra layer of security",
                  status: "Not enabled",
                  statusColor: "text-amber-700 bg-amber-50",
                  action: "Enable",
                },
                {
                  label: "Email address",
                  desc: "contact@techcorp.dz",
                  status: "Verified",
                  statusColor: "text-green-700 bg-green-50",
                  action: "Change",
                },
                { label: "Connected accounts", desc: "Google, Apple", status: null, action: "Manage" },
                {
                  label: "Active sessions",
                  desc: "2 devices currently signed in",
                  status: null,
                  action: "Sign out all",
                  danger: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{row.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {row.status && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${row.statusColor}`}>
                        {row.status}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={row.onAction}
                      className={`text-sm font-medium ${
                        row.danger
                          ? "text-red-600 border border-red-200 px-3 py-1 rounded-lg"
                          : "text-navy hover:underline"
                      }`}
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
                {
                  label: "New application alerts",
                  desc: "Get notified when a candidate applies to your listings.",
                },
                {
                  label: "Weekly digest",
                  desc: "Receive a weekly summary of applications, views, and activity.",
                },
                {
                  label: "Deadline reminders",
                  desc: "Get a reminder 3 days before any announcement deadline.",
                },
                {
                  label: "Platform news & updates",
                  desc: "Stay informed about new Linkio features and product updates.",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <Toggle
                    on={notifs[i]}
                    onChange={(v) => {
                      const n = [...notifs];
                      n[i] = v;
                      setNotifs(n);
                    }}
                  />
                </div>
              ))}
            </>
          )}

          {section === "privacy" && (
            <>
              <h2 className="font-semibold text-lg mb-1">Privacy</h2>
              <p className="text-sm text-gray-400 mb-6">Company profile visibility</p>
              {[
                {
                  label: "Show company profile publicly",
                  desc: "Your company page appears in search results for professionals.",
                },
                {
                  label: "Show contact phone number",
                  desc: "Verified professionals can see your business phone number.",
                },
                {
                  label: "Profile view notifications",
                  desc: "Know when a professional views your company profile.",
                },
                {
                  label: "Analytics & usage data",
                  desc: "Help us improve by sharing anonymous usage data.",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <Toggle
                    on={privacy[i]}
                    onChange={(v) => {
                      const p = [...privacy];
                      p[i] = v;
                      setPrivacy(p);
                    }}
                  />
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
                  <h3 className="font-semibold text-sm mb-2">Deactivate account</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Temporarily hide your company profile and pause listings. You can reactivate anytime by signing
                    back in.
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

      <Modal open={showDeactivate} onClose={() => setShowDeactivate(false)} className="max-w-md">
        <div className="bg-amber-light rounded-t-2xl px-6 py-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center text-amber-800 text-lg flex-shrink-0">
            !
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 text-lg">Deactivate your company account?</h3>
            <p className="text-sm text-amber-800/80 mt-1">Your profile and listings will be hidden until you reactivate.</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">While your account is deactivated:</p>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
            {[
              { ok: false, text: "Your company won't appear in professional searches" },
              { ok: false, text: "Active announcements will be paused (applicants are notified)" },
              { ok: true, text: "Your company data and applicant history are kept safe" },
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
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-sm mb-6 outline-none"
          >
            <option value="">Select a reason...</option>
            <option>Pausing hiring</option>
            <option>Company restructuring</option>
            <option>Privacy concerns</option>
            <option>Other</option>
          </select>
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
              onClick={() => setShowDeactivate(false)}
              className="flex-1 py-3 bg-amber text-white rounded-xl text-sm font-medium hover:bg-amber/90"
            >
              Yes, Deactivate
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} className="max-w-lg">
        <div className="px-6 py-5 border-b border-red-100">
          <div className="flex gap-3 items-start text-red-700">
            <span className="text-xl">⚠</span>
            <div>
              <h3 className="font-semibold text-lg">Delete your company account?</h3>
              <p className="text-sm text-red-600/80 mt-1">This action is permanent and cannot be undone.</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account will <strong>permanently remove</strong> all of the following:
          </p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-gray-700 space-y-2">
            <p>• Your company profile and public presence</p>
            <p>• All job announcements and applicant data</p>
            <p>• Billing and subscription history</p>
            <p>• Connected account data</p>
          </div>
          <label className="text-xs text-gray-500 block mb-2">To confirm, type TECHCORP below</label>
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type TECHCORP to confirm"
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
              disabled={deleteConfirm !== "TECHCORP" || !deleteChecked}
              onClick={() => {
                setShowDelete(false);
                navigate("/");
              }}
              className="flex-1 py-3 bg-red-400 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-500"
            >
              Delete Account Permanently
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            You will receive a confirmation email at contact@techcorp.dz
          </p>
        </div>
      </Modal>
    </div>
  );
}
