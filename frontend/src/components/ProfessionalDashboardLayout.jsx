import { NavLink, Outlet, useNavigate } from "react-router-dom";
import LinkioBrand from "./LinkioBrand";

const menuItems = [
  { to: "/professional/dashboard", label: "Dashboard", icon: "⊞", end: true },
  { to: "/professional/dashboard/announcements", label: "Announcements", icon: "≡" },
  { to: "/professional/dashboard/profile", label: "My Profile", icon: "◎" },
];

const accountItems = [{ to: "/professional/dashboard/settings", label: "Settings", icon: "⚙" }];

export default function ProfessionalDashboardLayout() {
  const navigate = useNavigate();

  const navItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-linkio text-sm transition-all
        ${
          isActive
            ? "bg-navy/10 text-navy font-medium"
            : "text-gray-500 hover:bg-ivory-warm hover:text-navy"
        }`
      }
    >
      <span className="w-4 text-center text-base">{item.icon}</span>
      {item.label}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-cream font-sans">
      <aside className="w-60 bg-white border-r border-ivory-deep fixed top-0 left-0 bottom-0 flex flex-col px-4 py-5 overflow-y-auto z-10">
        <div className="px-1 mb-6">
          <LinkioBrand logoWidth={32} logoHeight={20} />
        </div>

        <p className="linkio-eyebrow px-1 mb-2 before:hidden pl-0 text-[0.65rem]">Menu</p>
        <nav className="flex flex-col gap-1 mb-4">{menuItems.map(navItem)}</nav>

        <p className="linkio-eyebrow px-1 mb-2 before:hidden pl-0 text-[0.65rem]">Account</p>
        <nav className="flex flex-col gap-1">{accountItems.map(navItem)}</nav>

        <div className="mt-auto flex items-center gap-3 bg-ivory-warm rounded-linkio-lg p-3 mb-2">
          <div className="w-9 h-9 bg-navy rounded-full flex items-center justify-center text-white text-xs font-semibold">
            YB
          </div>
          <div>
            <p className="text-sm font-medium text-navy-deep">Yacine Benali</p>
            <p className="text-xs text-gray-500">Professional</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-left text-sm text-navy px-3 py-2 hover:underline"
        >
          ← Log out
        </button>
      </aside>

      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <div className="h-14 bg-cream/90 border-b border-ivory-deep flex items-center justify-between px-8">
          <span className="text-xs font-medium tracking-widest uppercase text-gold">Professional</span>
          <span className="text-sm text-gray-500">Portal</span>
        </div>
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
