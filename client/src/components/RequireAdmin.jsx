import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, booting } = useAuth();

  if (booting) return <p className="text-gray-600">Loading…</p>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}
