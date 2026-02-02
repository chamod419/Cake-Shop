import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, booting, signOut } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">CakeShop</Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/shop" className="hover:underline">Shop</Link>
            <Link to="/cart" className="hover:underline">Cart</Link>

            {!booting && user && user.role === "CUSTOMER" && (
              <Link to="/my-orders" className="hover:underline">My Orders</Link>
            )}

            {!booting && user?.role === "ADMIN" && (
              <Link to="/admin" className="hover:underline">Admin</Link>
            )}

            {!booting && !user && (
              <Link to="/auth" className="rounded-xl bg-black text-white px-4 py-2">
                Sign in
              </Link>
            )}

            {!booting && user && (
              <div className="flex items-center gap-3">
                <span className="text-gray-600">
                  @{user.username} {user.role === "ADMIN" ? "(Admin)" : ""}
                </span>
                <button onClick={onLogout} className="rounded-xl border px-4 py-2 hover:bg-gray-100">
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
