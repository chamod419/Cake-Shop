import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrderById } from "../api/orders";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const data = await fetchOrderById(id);
        if (alive) setOrder(data);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <p className="text-gray-600">Loading order…</p>;

  if (err) {
    return (
      <div className="rounded-xl border bg-red-50 p-4 text-red-700">
        {err}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6">
      <h1 className="text-2xl font-bold">Order placed ✅</h1>
      <p className="mt-2 text-gray-600">Order ID: <span className="font-mono">{order.id}</span></p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <p><span className="text-gray-600">Status:</span> {order.status}</p>
        <p><span className="text-gray-600">Total:</span> LKR {order.total.toLocaleString()}</p>
        <p><span className="text-gray-600">Type:</span> {order.type}</p>
        <p><span className="text-gray-600">When:</span> {order.date} {order.time}</p>
        {order.address && <p className="sm:col-span-2"><span className="text-gray-600">Address:</span> {order.address}</p>}
      </div>

      <div className="mt-5 border-t pt-4 space-y-2 text-sm">
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate">{i.name}</p>
              <p className="text-gray-600">Qty {i.qty}</p>
            </div>
            <p className="font-semibold">LKR {(i.price * i.qty).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/shop" className="rounded-xl bg-black text-white px-5 py-3">
          Continue shopping
        </Link>
        {/* <Link to="/admin" className="rounded-xl border px-5 py-3">
          Admin Panel
        </Link> */}
      </div>
    </div>
  );
}
