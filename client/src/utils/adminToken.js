const KEY = "cake_admin_token";

export function setAdminToken(token) {
  localStorage.setItem(KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(KEY) || "";
}

export function clearAdminToken() {
  localStorage.removeItem(KEY);
}
