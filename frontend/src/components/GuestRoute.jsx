import { Navigate } from "react-router-dom";
import { isAuthenticated, getDashboardPath } from "../services/auth";

export default function GuestRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to={getDashboardPath()} replace />;
  }
  return children;
}
