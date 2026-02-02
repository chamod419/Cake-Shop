import { apiFetch, apiFetchForm } from "./http";

// ORDERS
export function adminFetchOrders() {
  return apiFetch("/api/admin/orders");
}

export function adminUpdateOrderStatus(orderId, status) {
  return apiFetch(`/api/admin/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// PRODUCTS
export function adminFetchProducts() {
  return apiFetch("/api/admin/products");
}

export function adminCreateProduct(formData) {
  return apiFetchForm("/api/admin/products", { method: "POST", formData });
}

export function adminUpdateProduct(productId, formData) {
  return apiFetchForm(`/api/admin/products/${productId}`, { method: "PUT", formData });
}

export function adminDeleteProduct(productId) {
  return apiFetch(`/api/admin/products/${productId}`, { method: "DELETE" });
}
