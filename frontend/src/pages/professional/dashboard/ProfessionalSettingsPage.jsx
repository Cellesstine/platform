import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../../components/ui";
import { goToChangePassword } from "../../auth/passwordReset/shared";
import { deactivateAccount, deleteAccount, logout, changeEmail, getSecurityStatus } from "../../../services/accountApi";
import { clearAuth, getUserEmail, parseApiError } from "../../../services/auth";
import { getMyProfileDetails } from "../../../services/profilesApi";

export default function ProfessionalSettingsPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState("security");
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangePassword, setEmailChangePassword] = useState("");
  const [emailChangeSuccess, setEmailChangeSuccess] = useState("");
  const [fullName, setFullName] = useState("");

  const userEmail = getUserEmail();
  const displayName = fullName || userEmail?.split("@")[0] || "User";
  const initials = fullName
    ? fullName.replace(/\s+/g, "").slice(0, 2).toUpperCase()
    : userEmail
    ? userEmail.replace(/\s+/g, "").slice(0, 2).toUpperCase()
    : "PR";
  const [hasUsablePassword, setHasUsablePassword] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchSecurityStatus() {
      try {
        const status = await getSecurityStatus();
        if (cancelled) return;
        setHasUsablePassword(status.has_usable_password);
      } catch (err) {
        console.error("Failed to fetch security status:", err);
      }
    }
    async function fetchProfile() {
      try {
        const data = await getMyProfileDetails();
        if (cancelled) return;
        if (data && data.full_name) {
          setFullName(data.full_name);
        } else if (data && data.first_name && data.last_name) {
          setFullName(`${data.first_name} ${data.last_name}`);
        }
      } catch (err) {
        console.error("Failed to fetch profile details:", err);
      }
    }
    fetchSecurityStatus();
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeactivate = async () => {
    if (hasUsablePassword && !deactivatePassword) return;
    setAccountLoading(true);
    setAccountError("");
    try {
      await deactivateAccount(hasUsablePassword ? deactivatePassword : "");
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
    if (hasUsablePassword && !deletePassword) return;
    setAccountLoading(true);
    setAccountError("");
    try {
      await deleteAccount(hasUsablePassword ? deletePassword : "");
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
        "Verification email sent. Open the link on this app to complete verification."
      );
    } catch (err) {
      setAccountError(parseApiError(err, "Unable to change email."));
    } finally {
      setAccountLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-navy font-normal mb-2">Account Settings</h1>
        <p className="text-sm text-gray-500">Update your security settings and preferences.</p>
      </div>

      {emailChangeSuccess && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-150 rounded-2xl p-4 mb-6 shadow-sm flex items-center gap-3">
          <span className="text-lg">✓</span>
          <p className="font-medium">{emailChangeSuccess}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* User Card Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-150/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
            {/* Initials Avatar with Navy Glow */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0b1e36] to-[#1d3d63] text-white flex items-center justify-center text-2xl font-serif font-bold shadow-md relative overflow-hidden mb-4">
              <div className="absolute inset-0 bg-white/5 opacity-50 blur-[1px]" />
              <span className="relative z-10">{initials}</span>
            </div>
            
            <h2 className="font-serif text-xl font-medium text-gray-900 capitalize mb-1">{displayName}</h2>
            <p className="text-xs text-gray-400 font-medium mb-3">{userEmail}</p>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
              <i>Professional</i>
            </span>
          </div>

          <nav className="bg-white rounded-3xl p-3 border border-gray-150/50 shadow-sm flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setSection("security")}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center gap-3 font-medium ${
                section === "security"
                  ? "bg-[#0B1E36] text-white shadow-md"
                  : "text-gray-600 hover:bg-slate-50 hover:text-[#0B1E36]"
              }`}
            >
              {/* Lock SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Security
            </button>
          </nav>
        </div>

        {/* Content Box */}
        <div className="flex-1 bg-white rounded-3xl p-8 border border-gray-150/50 shadow-sm min-h-[450px]">
          {section === "security" && (
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="font-serif text-2xl text-gray-900 font-medium mb-1">Security Settings</h3>
                <p className="text-xs text-gray-400">Protect your account and control authorization credentials.</p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Password Item */}
                <div className="bg-slate-50/50 border border-gray-100 rounded-2xl p-5 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Password</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {hasUsablePassword ? "Configure and change your credentials" : "No password configured yet (using Google)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${
                      hasUsablePassword ? "text-green-700 bg-green-50 border border-green-200/50" : "text-amber-700 bg-amber-50 border border-amber-200/50"
                    }`}>
                      {hasUsablePassword ? "Configured" : "Not Set"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (hasUsablePassword) {
                          goToChangePassword(navigate, "professional");
                        } else {
                          navigate("/reset-password", {
                            state: {
                              fromSettings: true,
                              isSetPassword: true,
                              returnTo: "/professional/dashboard/settings",
                              portal: "professional",
                            },
                          });
                        }
                      }}
                      className="px-4 py-2 bg-[#0B1E36] hover:bg-[#132c4d] text-white border border-[#0B1E36] rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {hasUsablePassword ? "Change Password" : "Set Password"}
                    </button>
                  </div>
                </div>

                {/* Email Item */}
                <div className="bg-slate-50/50 border border-gray-100 rounded-2xl p-5 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Email Address</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Primary communication address: <span className="font-medium text-gray-700">{userEmail}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold text-green-700 bg-green-50 border border-green-200/50">
                      Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowChangeEmail(true)}
                      className="px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold hover:bg-white text-gray-700 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      Change Email
                    </button>
                  </div>
                </div>

                {/* Account Lifecycle Card */}
                <div className="bg-red-50/10 border border-red-100/60 rounded-3xl p-6 mt-4">
                  <h4 className="text-sm font-semibold text-red-950 mb-1">Danger Zone</h4>
                  <p className="text-xs text-red-700/60 mb-5">Actions below are critical to your profile lifecycle.</p>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-red-100/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Deactivate Account</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Temporarily hide your profile. Sign in again to reactivate.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountError("");
                          setDeactivatePassword("");
                          setShowDeactivate(true);
                        }}
                        className="px-4 py-2 bg-[#0B1E36] hover:bg-[#132c4d] text-white border border-[#0B1E36] rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        Deactivate
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-red-100/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">Delete Account</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Permanently delete your profile and application history.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountError("");
                          setDeletePassword("");
                          setShowDelete(true);
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-semibold hover:bg-red-100/60 transition-all cursor-pointer"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deactivate account modal (asks only for password if hasUsablePassword is true) */}
      <Modal open={showDeactivate} onClose={() => setShowDeactivate(false)} className="max-w-md">
        <div className="bg-blue-50/50 border-b border-blue-100 rounded-t-2xl px-6 py-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0B1E36] flex items-center justify-center font-bold text-lg flex-shrink-0">
            !
          </div>
          <div>
            <h3 className="font-semibold text-[#0B1E36] text-base">Deactivate account?</h3>
            <p className="text-xs text-blue-900/70 mt-1">This will temporarily hide your profile from employers.</p>
          </div>
        </div>
        <div className="p-6">
          {hasUsablePassword ? (
            <>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Enter Password to Confirm</label>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-sm mb-4 outline-none border border-gray-200 focus:border-[#0B1E36] transition-colors"
              />
            </>
          ) : (
            <p className="text-xs text-gray-500 mb-4 font-medium">
              Confirming this action does not require a password as you log in via Google.
            </p>
          )}
          {accountError && <p className="text-xs text-red-600 mb-4 font-medium">{accountError}</p>}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowDeactivate(false)}
              className="flex-1 py-3 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={accountLoading || (hasUsablePassword && !deactivatePassword)}
              onClick={handleDeactivate}
              className="flex-1 py-3 bg-[#0B1E36] hover:bg-[#132c4d] text-white rounded-2xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {accountLoading ? "Deactivating…" : "Confirm Deactivation"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete account modal (asks only for password if hasUsablePassword is true) */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} className="max-w-md">
        <div className="bg-red-50 border-b border-red-100 rounded-t-2xl px-6 py-5 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
            ⚠
          </div>
          <div>
            <h3 className="font-semibold text-red-950 text-base">Delete account permanently?</h3>
            <p className="text-xs text-red-600/80 mt-1">This action is permanent and completely irreversible.</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Deleting your account will permanently wipe your profile details, application logs, and portfolio data.
          </p>
          
          {hasUsablePassword ? (
            <>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Enter Password to Confirm</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-sm mb-4 outline-none border border-gray-200 focus:border-red-400 transition-colors"
              />
            </>
          ) : (
            <p className="text-xs text-gray-500 mb-4 font-medium">
              Confirming this action does not require a password as you log in via Google.
            </p>
          )}
          {accountError && <p className="text-xs text-red-600 mb-4 font-medium">{accountError}</p>}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowDelete(false)}
              className="flex-1 py-3 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={accountLoading || (hasUsablePassword && !deletePassword)}
              onClick={handleDelete}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {accountLoading ? "Deleting…" : "Delete Account"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change email modal */}
      <Modal open={showChangeEmail} onClose={() => setShowChangeEmail(false)} className="max-w-md">
        <div className="p-6">
          <h3 className="font-serif text-lg text-gray-900 font-medium mb-1">Change email address</h3>
          <p className="text-xs text-gray-400 mb-5">
            A confirmation link will be sent to the new email address.
          </p>

          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">New Email Address</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="e.g. candidate@newemail.com"
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-sm mb-4 outline-none border border-gray-200 focus:border-[#0B1E36] transition-colors"
          />

          {hasUsablePassword && (
            <>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Current Password</label>
              <input
                type="password"
                value={emailChangePassword}
                onChange={(e) => setEmailChangePassword(e.target.value)}
                placeholder="Confirm with password"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-sm mb-4 outline-none border border-gray-200 focus:border-[#0B1E36] transition-colors"
              />
            </>
          )}

          {accountError && <p className="text-xs text-red-600 mb-4 font-medium">{accountError}</p>}
          
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowChangeEmail(false)}
              className="flex-1 py-3 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!newEmail.trim() || accountLoading}
              onClick={handleChangeEmail}
              className="flex-1 py-3 bg-[#0B1E36] hover:bg-[#132c4d] text-white rounded-2xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {accountLoading ? "Sending…" : "Send verification"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
