import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getUserRole, getDashboardPath } from "../services/auth";

/**
 * @param {{ children: import('react').ReactNode, role?: 'individual' | 'enterprise' }} props
 */
export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  const userRole = getUserRole();
  if (role && userRole && userRole !== role) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return children;
}
