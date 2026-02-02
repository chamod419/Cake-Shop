import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { createOrder } from "../api/orders";

function isValidEmail(v) {
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function cleanPhone(v) {
  return String(v || "").replace(/[^\d+]/g, "");
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
    type: "pickup", // pickup | delivery
    date: "",
    time: "",
    address: "",
  });

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!cleanPhone(form.phone)) e.phone = "Phone is required";
    if (!isValidEmail(form.email)) e.email = "Invalid email";

    if (!form.date) e.date = "Date is required";
    if (!form.time) e.time = "Time is required";

    if (form.type === "delivery" && !form.address.trim()) e.address = "Address is required";
    if (!items || items.length === 0) e.cart = "Your cart is empty";
    return e;
  }, [form, items]);

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (Object.keys(errors).length > 0) {
      setServerError("Please fix the errors and try again.");
      return;
    }

    const payload = {
      customer: {
        name: form.name.trim(),
        phone: cleanPhone(form.phone),
        email: form.email.trim() || undefined,
        note: form.note.trim() || undefined,
      },
      fulfillment: {
        type: form.type,
        date: form.date,
        time: form.time,
        address: form.type === "delivery" ? form.address.trim() : undefined,
      },
      items: items.map((it) => ({
        productId: it.id,
        qty: Number(it.qty || 1),
        size: it.size || undefined,
        flavor: it.flavor || undefined,
      })),
    };

    setSubmitting(true);
    try {
      const order = await createOrder(payload);
      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      setServerError(err.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Form */}
      <div className="lg:col-span-2 rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-1 text-gray-600">Confirm your details and place the order.</p>

        {serverError && (
          <div className="mt-4 rounded-xl border bg-red-50 p-3 text-red-700">
            {serverError}
          </div>
        )}

        {errors.cart && (
          <div className="mt-4 rounded-xl border bg-yellow-50 p-3 text-yellow-800">
            {errors.cart}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <input
                className="mt-1 w-full rounded-xl border px-4 py-2"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Phone *</label>
              <input
                className="mt-1 w-full rounded-xl border px-4 py-2"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Email (optional)</label>
              <input
                className="mt-1 w-full rounded-xl border px-4 py-2"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Fulfillment *</label>
              <div className="mt-2 flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={form.type === "pickup"}
                    onChange={() => setForm((f) => ({ ...f, type: "pickup" }))}
                  />
                  Pickup
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={form.type === "delivery"}
                    onChange={() => setForm((f) => ({ ...f, type: "delivery" }))}
                  />
                  Delivery
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border px-4 py-2"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Time *</label>
              <input
                type="time"
                className="mt-1 w-full rounded-xl border px-4 py-2"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
              {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time}</p>}
            </div>

            {form.type === "delivery" && (
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Delivery Address *</label>
                <textarea
                  rows={3}
                  className="mt-1 w-full rounded-xl border px-4 py-2"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
                {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Note (optional)</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-xl border px-4 py-2"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>

          <button
            disabled={submitting || Object.keys(errors).length > 0}
            className="w-full rounded-xl bg-black text-white py-3 font-medium disabled:opacity-60"
          >
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </form>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border bg-white p-6 h-fit">
        <h2 className="text-lg font-semibold">Order Summary</h2>

        <div className="mt-4 space-y-3">
          {items.map((it) => {
            const price = Number(it.price) || 0;
            const qty = Number(it.qty) || 1;
            return (
              <div key={it.id} className="flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{it.name}</p>
                  <p className="text-gray-600">Qty {qty}</p>
                </div>
                <p className="font-semibold">LKR {(price * qty).toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t pt-4 flex justify-between text-sm">
          <span className="text-gray-600">Total</span>
          <span className="font-bold">LKR {(Number(total) || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
