import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const cls = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm ${
      isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          Jonathan's Bakes
        </Link>

        <nav className="flex gap-2">
          <NavLink to="/" className={cls}>
            Home
          </NavLink>
          <NavLink to="/shop" className={cls}>
            Shop
          </NavLink>
          <NavLink to="/cart" className={cls}>
            Cart
          </NavLink>
          <NavLink to="/admin" className={cls}>
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
