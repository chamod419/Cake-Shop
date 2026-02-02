import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setAdminToken } from "../utils/adminToken";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin";

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!token.trim()) {
      setErr("Please enter admin token.");
      return;
    }

    setAdminToken(token.trim());
    navigate(from, { replace: true });
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl border bg-white p-6">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <p className="mt-1 text-gray-600">
        Enter your admin token to access the dashboard.
      </p>

      {err && (
        <div className="mt-4 rounded-xl border bg-red-50 p-3 text-red-700">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="text-sm font-medium">Admin Token</label>
        <input
          className="w-full rounded-xl border px-4 py-2"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="e.g. 12345"
        />

        <button className="w-full rounded-xl bg-black text-white py-3">
          Login
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        This token must match <b>ADMIN_TOKEN</b> in your server <b>.env</b>.
      </p>
    </div>
  );
}
