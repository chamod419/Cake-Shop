import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  return (
    <Link
      to={`/product/${p.id}`}
      className="group rounded-2xl border bg-white overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-[3/2] bg-gray-100 overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{p.name}</h3>
          <span className="text-sm text-gray-600">⭐ {p.rating}</span>
        </div>

        <p className="mt-1 text-sm text-gray-600">{p.category}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold">LKR {p.price.toLocaleString()}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${p.isAvailable ? "bg-green-100" : "bg-gray-200"}`}>
            {p.isAvailable ? "Available" : "Pre-order"}
          </span>
        </div>
      </div>
    </Link>
  );
}
