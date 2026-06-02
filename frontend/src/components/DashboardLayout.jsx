import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout as apiLogout } from "../services/accountApi";
import { clearAuth } from "../services/auth";

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const AnnouncementsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M12 22c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2z" />
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z" />
  </svg>
);

const ApplicantsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

const ProfessionalsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const menuItems = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon />, end: true },
  { to: "/dashboard/announcements", label: "Announcements", icon: <AnnouncementsIcon /> },
  { to: "/dashboard/applicants", label: "Applicants", icon: <ApplicantsIcon /> },
  { to: "/dashboard/find-workers", label: "Find Professionals", icon: <ProfessionalsIcon /> },
  { to: "/dashboard/company-profile", label: "Company Profile", icon: <ProfileIcon /> },
];

const accountItems = [{ to: "/dashboard/settings", label: "Settings", icon: <SettingsIcon /> }];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);


  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error("Logout API call failed:", e);
    } finally {
      clearAuth();
      navigate("/sign-in", { replace: true });
    }
  };


  const navItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-300
        ${
          isActive
            ? "bg-white/15 text-white font-medium shadow-sm"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        }
        ${isCollapsed ? "justify-center" : ""}`
      }
    >
      {item.icon}
      {!isCollapsed && <span>{item.label}</span>}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-[#f8fafc] via-[#f1f5f9] to-[#7f1d1d]/10 font-sans transition-all duration-300">
      {/* Collapsible Dark Cherry Red Sidebar */}
      <aside 
        className={`bg-[#3C0713] border-r border-[#3c0713]/25 fixed top-0 left-0 bottom-0 flex flex-col px-4 py-5 z-10 transition-all duration-300 ease-out
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Brand / Logo */}
        <div 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`px-1 mb-8 h-8 flex items-center cursor-pointer select-none ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {!isCollapsed ? (
            <span className="font-serif text-xl font-bold text-white tracking-tight hover:text-white/80 transition-colors">
              Linkio
            </span>
          ) : (
            <span className="font-serif text-lg font-bold text-white hover:text-white/80 transition-colors">
              L
            </span>
          )}
        </div>

        {!isCollapsed && (
          <p className="px-1 mb-2 text-[0.65rem] font-bold tracking-widest text-white/40 uppercase">Menu</p>
        )}
        <nav className="flex flex-col gap-1 mb-6">{menuItems.map(navItem)}</nav>

        {!isCollapsed && (
          <p className="px-1 mb-2 text-[0.65rem] font-bold tracking-widest text-white/40 uppercase">Account</p>
        )}
        <nav className="flex flex-col gap-1 mb-6">{accountItems.map(navItem)}</nav>

        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Log out" : undefined}
          className={`text-left text-sm text-white/70 px-3 py-2.5 hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
        >
          <LogoutIcon />
          {!isCollapsed && <span>Log out</span>}
        </button>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out
          ${isCollapsed ? "ml-20" : "ml-64"}
        `}
      >
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
