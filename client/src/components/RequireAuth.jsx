import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, booting } = useAuth();
  const loc = useLocation();

  if (booting) return <p className="text-gray-600">Loading…</p>;
  if (!user) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  return children;
}
