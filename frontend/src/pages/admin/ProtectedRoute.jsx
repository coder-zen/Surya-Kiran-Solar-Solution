import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Wraps admin-only routes. Redirects to /admin/login if not authenticated,
 * or if authenticated but lacking sufficient role privileges.
 */
const ProtectedRoute = ({ children, allowedRoles = ["admin", "super_admin", "editor", "employee"] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Checking session…</div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/admin/login" replace />;

  return children;
};

export default ProtectedRoute;
