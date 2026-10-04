import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RoleRouteProps {
  allowedRoles: string[];
}

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;