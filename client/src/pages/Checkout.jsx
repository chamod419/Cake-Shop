import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/http";
import { money } from "../utils/pricing";

export default function Checkout() {
  const cart = useCart();
  const auth = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState("pickup");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  });

  const [fulfillment, setFulfillment] = useState({
    date: "",
    time: "",
    address: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Always compute totals using unitPrice
  const summary = useMemo(() => {
    const items = cart.items.map((it) => {
      const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
      const qty = Number(it.qty ?? 0);
      return {
        ...it,
        unitPrice,
        lineTotal: unitPrice * qty,
      };
    });

    const total = items.reduce((sum, it) => sum + it.lineTotal, 0);
    return { items, total };
  }, [cart.items]);

  async function placeOrder() {
    setErr("");

    if (!customer.name.trim()) return setErr("Name is required");
    if (!customer.phone.trim()) return setErr("Phone is required");
    if (!fulfillment.date.trim()) return setErr("Date is required");
    if (!fulfillment.time.trim()) return setErr("Time is required");
    if (type === "delivery" && !fulfillment.address.trim()) return setErr("Address is required");

    if (!summary.items.length) return setErr("Cart is empty");

    try {
      setSubmitting(true);

      // send items to server (server will recalc price too, but we still send selected size/flavor/qty)
      const payload = {
        customer,
        fulfillment: {
          type,
          date: fulfillment.date,
          time: fulfillment.time,
          address: type === "delivery" ? fulfillment.address : "",
        },
        items: summary.items.map((it) => ({
          productId: it.productId,
          qty: it.qty,
          size: it.size,
          flavor: it.flavor,
        })),
      };

      const created = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      cart.clear();
      navigate(`/order-success/${created.id}`);
    } catch (e) {
      setErr(e.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border bg-white p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-gray-600">Confirm your details and place the order.</p>
        </div>

        {err && <div className="rounded-xl border bg-red-50 p-3 text-red-700">{err}</div>}

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={customer.name}
              onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone *</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={customer.phone}
              onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
              placeholder="07XXXXXXXX"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email (optional)</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={customer.email}
              onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Fulfillment *</label>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={type === "pickup"}
                  onChange={() => setType("pickup")}
                />
                Pickup
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={type === "delivery"}
                  onChange={() => setType("delivery")}
                />
                Delivery
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Date *</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={fulfillment.date}
              onChange={(e) => setFulfillment((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Time *</label>
            <input
              type="time"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={fulfillment.time}
              onChange={(e) => setFulfillment((f) => ({ ...f, time: e.target.value }))}
            />
          </div>

          {type === "delivery" && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Address *</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={fulfillment.address}
                onChange={(e) => setFulfillment((f) => ({ ...f, address: e.target.value }))}
                placeholder="Delivery address"
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Note (optional)</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={3}
            value={customer.note}
            onChange={(e) => setCustomer((c) => ({ ...c, note: e.target.value }))}
            placeholder="Any special request..."
          />
        </div>

        <button
          disabled={submitting}
          onClick={placeOrder}
          className="w-full rounded-xl bg-black text-white py-3 disabled:opacity-60"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </div>

      {/* ✅ Order Summary */}
      <div className="rounded-2xl border bg-white p-6 space-y-4 h-fit">
        <h2 className="font-bold">Order Summary</h2>

        <div className="space-y-3">
          {summary.items.map((it) => (
            <div key={`${it.productId}-${it.size}-${it.flavor}`} className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{it.name}</p>
                <p className="text-sm text-gray-600">
                  Qty {it.qty}
                  {it.size ? ` • ${it.size}` : ""}
                  {it.flavor ? ` • ${it.flavor}` : ""}
                </p>
              </div>
              <p className="font-semibold">{money(it.lineTotal)}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <p className="text-gray-700">Total</p>
          <p className="text-lg font-bold">{money(summary.total)}</p>
        </div>

        <p className="text-xs text-gray-500">
          Logged in as: {auth.user?.email}
        </p>
      </div>
    </div>
  );
}
