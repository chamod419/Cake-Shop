import { apiFetch } from "./http";

export function authMe() {
  return apiFetch("/api/auth/me", { method: "GET" });
}

export function authLogin(username, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function authRegister(username, password) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function authLogout() {
  return apiFetch("/api/auth/logout", { method: "POST" });
}
