import { Link, useLocation } from "react-router-dom";
import LinkioBrand from "./LinkioBrand";

export default function Navbar() {
  const { pathname } = useLocation();

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`text-sm font-normal transition-colors no-underline ${
        pathname === path ? "text-navy font-medium" : "text-gray-500 hover:text-navy"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 linkio-topbar">
      <LinkioBrand />

      <div className="hidden md:flex items-center gap-8">
        {navLink("/how", "How it works")}
        <a href="/#join" className="text-sm text-gray-500 hover:text-navy no-underline transition-colors">
          For Professionals
        </a>
        <a href="/#join" className="text-sm text-gray-500 hover:text-navy no-underline transition-colors">
          For Businesses
        </a>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/sign-in" className="btn-linkio-ghost hidden sm:inline-flex">
          Sign in
        </Link>
        <Link to="/register" className="btn-linkio-navy">
          Get started
        </Link>
      </div>
    </nav>
  );
}
