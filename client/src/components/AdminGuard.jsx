import { Navigate, useLocation } from "react-router-dom";
import { getAdminToken } from "../utils/adminToken";

export default function AdminGuard({ children }) {
  const token = getAdminToken();
  const loc = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  }

  return children;
}
