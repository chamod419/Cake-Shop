import { API_BASE_URL } from "../api/http";

export default function resolveImage(src) {
  if (!src) return "";
  if (src.startsWith("http")) return src;          // external images
  if (src.startsWith("data:")) return src;         // base64 images if any
  return `${API_BASE_URL}${src}`;                  // /uploads/... -> http://localhost:5000/uploads/...
}
