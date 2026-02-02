import { apiFetch } from "./http";

export function createOrder(payload) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchOrderById(id) {
  return apiFetch(`/api/orders/${id}`, { method: "GET" });
}

export function fetchMyOrders() {
  return apiFetch("/api/orders?mine=1", { method: "GET" });
}
