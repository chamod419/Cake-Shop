const API_BASE_URL = "http://localhost:5000";

export async function fetchProducts() {
  const res = await fetch(`${API_BASE_URL}/api/products`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to load products");
  return data;
}

export async function fetchProducts({ q = "", category = "" } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);

  const res = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}
