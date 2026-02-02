import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../api/products";
import { useCart } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [p, setP] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [size, setSize] = useState("");
  const [flavor, setFlavor] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setErr("");
    fetchProductById(id)
      .then((data) => {
        setP(data);
        setSize(data.sizes?.[0] || "");
        setFlavor(data.flavors?.[0] || "");
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10">Loading…</div>;
  if (err) return <div className="p-10 text-red-600">Error: {err}</div>;
  if (!p) return null;

  function handleAdd() {
    addItem({
      productId: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      size,
      flavor,
      qty
    });
    navigate("/cart");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/shop" className="text-gray-600 hover:underline">
        ← Back to Shop
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl overflow-hidden border bg-gray-100">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <p className="mt-2 text-gray-600">{p.description}</p>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-bold text-xl">LKR {p.price.toLocaleString()}</span>
            <span className="text-sm text-gray-600">⭐ {p.rating}</span>
          </div>

          <div className="mt-6">
            <p className="font-semibold">Size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-full border px-3 py-1 text-sm ${size === s ? "bg-black text-white" : "bg-white"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="font-semibold">Flavor</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.flavors.map((f) => (
                <button
                  key={f}
                  onClick={() => setFlavor(f)}
                  className={`rounded-full border px-3 py-1 text-sm ${flavor === f ? "bg-black text-white" : "bg-white"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="font-semibold">Quantity</p>
            <div className="mt-2 flex items-center gap-2">
              <button className="rounded-lg border px-3 py-1" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span className="min-w-8 text-center">{qty}</span>
              <button className="rounded-lg border px-3 py-1" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={handleAdd} className="rounded-xl bg-black text-white px-5 py-3 font-medium">
              Add to Cart
            </button>
            <Link to="/cart" className="rounded-xl border px-5 py-3 font-medium">
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
