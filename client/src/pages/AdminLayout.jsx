import { NavLink, Outlet } from "react-router-dom";

function Tab({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-xl px-4 py-2 border text-sm ${
          isActive ? "bg-black text-white border-black" : "bg-white hover:bg-gray-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function AdminLayout() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Manage orders and products.</p>
        </div>

        <div className="flex items-center gap-2">
          <Tab to="/admin" end>Orders</Tab>
          <Tab to="/admin/products">Products</Tab>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
