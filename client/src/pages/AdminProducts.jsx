import { useEffect, useMemo, useState } from "react";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminFetchProducts,
  adminUpdateProduct,
} from "../api/admin";
import { API_BASE_URL } from "../api/http";

function resolveImage(src) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return `${API_BASE_URL}${src}`;
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Birthday",
    rating: "4.5",
    description: "",
    sizes: "0.5kg,1kg,2kg",
    flavors: "Chocolate",
    isAvailable: "true",
    imageFile: null,
  });

  const categories = useMemo(
    () => ["Birthday", "Celebration", "Wedding", "Cupcakes", "Special"],
    []
  );

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const data = await adminFetchProducts();
      setProducts(data);
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      category: "Birthday",
      rating: "4.5",
      description: "",
      sizes: "0.5kg,1kg,2kg",
      flavors: "Chocolate",
      isAvailable: "true",
      imageFile: null,
    });
  }

  function fillEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      category: p.category || "Birthday",
      rating: String(p.rating ?? "4.5"),
      description: p.description || "",
      sizes: (p.sizes || []).join(","),
      flavors: (p.flavors || []).join(","),
      isAvailable: String(p.isAvailable ?? true),
      imageFile: null, // optional new image
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setErr("");

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("category", form.category);
      fd.append("rating", form.rating);
      fd.append("description", form.description);
      fd.append("sizes", form.sizes);
      fd.append("flavors", form.flavors);
      fd.append("isAvailable", form.isAvailable);

      // ✅ important: server expects field name = "image"
      if (form.imageFile) fd.append("image", form.imageFile);

      if (!editingId) {
        if (!form.imageFile) throw new Error("Please select an image file");
        await adminCreateProduct(fd);
      } else {
        await adminUpdateProduct(editingId, fd);
      }

      await load();
      resetForm();
    } catch (e2) {
      setErr(e2.message || "Failed to save product");
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      setErr("");
      await adminDeleteProduct(id);
      await load();
    } catch (e) {
      setErr(e.message || "Failed to delete product");
    }
  }

  if (loading) return <p className="text-gray-600">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Products</h2>
        <p className="text-gray-600">Add, edit, delete products with photo upload.</p>
      </div>

      {err && (
        <div className="rounded-xl border bg-red-50 p-3 text-red-700">{err}</div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingId ? "Edit Product" : "Add Product"}</h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Price (Rs)"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />

          <select
            className="rounded-xl border px-3 py-2"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Rating (ex: 4.7)"
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
          />

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Sizes (comma separated)"
            value={form.sizes}
            onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
          />

          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Flavors (comma separated)"
            value={form.flavors}
            onChange={(e) => setForm((f) => ({ ...f, flavors: e.target.value }))}
          />

          <select
            className="rounded-xl border px-3 py-2"
            value={form.isAvailable}
            onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.value }))}
          >
            <option value="true">Available</option>
            <option value="false">Not available</option>
          </select>

          <input
            className="rounded-xl border px-3 py-2"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] || null }))}
            required={!editingId}
          />
        </div>

        <textarea
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        <button className="rounded-xl bg-black text-white px-5 py-2">
          {editingId ? "Update Product" : "Create Product"}
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Photo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Category</th>
              <th className="p-3">Available</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  {p.image ? (
                    <img
                      src={resolveImage(p.image)}
                      alt={p.name}
                      className="h-14 w-20 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="h-14 w-20 rounded-lg border bg-gray-100" />
                  )}
                </td>

                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">Rs. {Number(p.price).toLocaleString()}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.isAvailable ? "Yes" : "No"}</td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => fillEdit(p)}
                    className="rounded-xl border px-4 py-2 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="rounded-xl border px-4 py-2 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!products.length && (
              <tr>
                <td className="p-4 text-gray-600" colSpan={6}>
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
