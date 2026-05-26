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

export function OAuthButtons() {
  return (
    <div className="flex gap-3 mb-6">
      <button
        type="button"
        className="flex-1 flex items-center justify-center gap-2 py-3 border border-navy/10 rounded-linkio text-sm font-medium bg-white hover:bg-ivory-warm transition-all"
      >
        Google
      </button>
      <button
        type="button"
        className="flex-1 flex items-center justify-center gap-2 py-3 border border-navy/10 rounded-linkio text-sm font-medium bg-white hover:bg-ivory-warm transition-all"
      >
        Apple
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
