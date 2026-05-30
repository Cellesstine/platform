import { getPortal } from "../theme/portal";

export function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? "bg-navy" : "bg-ivory-deep"}`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export function Tag({ children, variant = "default" }) {
  const styles = {
    default: "bg-ivory-warm text-gray-600",
    remote: "bg-pro-blue/40 text-navy",
    new: "bg-gold/15 text-navy border border-gold/30",
    presential: "bg-navy/10 text-navy",
    skill: "bg-navy/10 text-navy",
    warning: "bg-amber-light text-amber-900 border border-amber/30",
    success: "bg-navy/10 text-navy",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-linkio font-medium ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, children, className = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative linkio-panel w-full ${className}`}>{children}</div>
    </div>
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-navy-deep">{label}</label>}
      {children}
    </div>
  );
}

export const inputClass =
  "w-full px-4 py-3 rounded-linkio bg-ivory-warm border border-transparent text-sm outline-none focus:border-navy focus:bg-white transition-colors";

export const linkioPanelClass = "bg-white rounded-linkio-lg border border-navy/10 shadow-sm";

export function FormDivider({ label = "Or continue with" }) {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="absolute w-full h-px bg-ivory-deep" />
      <span className="relative bg-cream px-3 text-[11px] text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export function OAuthButtons({ role = "individual" }) {
  const handleGoogleLogin = () => {
    const apiBase = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    window.location.href = `${apiBase}/account/google/login/init/?role=${role}`;
  };

  return (
    <div className="flex gap-3 mb-6">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex-1 flex items-center justify-center gap-2 py-3 border border-navy/10 rounded-linkio text-sm font-medium bg-white hover:bg-ivory-warm transition-all hover:border-navy/30"
      >
        <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        <span>Google</span>
      </button>
      <button
        type="button"
        className="flex-1 flex items-center justify-center gap-2 py-3 border border-navy/10 rounded-linkio text-sm font-medium bg-white/50 text-gray-400 cursor-not-allowed"
        title="Apple sign in is currently unavailable"
        disabled
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.52 2.81-1.33z" fill="#9CA3AF"/>
        </svg>
        <span>Apple</span>
      </button>
    </div>
  );
}

export function AlertError({ children }) {
  if (!children) return null;
  return <p className="linkio-alert-error mb-4">{children}</p>;
}

export function PrimaryButton({ portal = "business", disabled, loading, children, className = "", type = "button", onClick }) {
  const theme = getPortal(portal);
  const enabled = !disabled && !loading;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={
        enabled
          ? `${theme.primaryBtn} w-full ${className}`
          : `${theme.primaryBtnDisabled} ${className}`
      }
    >
      {loading ? "Sending…" : children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", onClick, type = "button" }) {
  return (
    <button type={type} onClick={onClick} className={`btn-linkio-ghost ${className}`}>
      {children}
    </button>
  );
}

export function PageTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="linkio-eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-serif text-3xl text-navy-deep font-normal mb-2">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

export function DashboardCard({ children, className = "" }) {
  return <div className={`linkio-panel p-6 ${className}`}>{children}</div>;
}

export function DashPrimaryButton({ portal = "business", children, className = "", onClick, type = "button" }) {
  const theme = getPortal(portal);
  return (
    <button type={type} onClick={onClick} className={`${theme.primaryBtn} ${className}`}>
      {children}
    </button>
  );
}
