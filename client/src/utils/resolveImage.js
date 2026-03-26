const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function resolveImage(src) {
  if (!src) return "https://placehold.co/900x600?text=Cake";
  if (src.startsWith("http")) return src;
  if (src.startsWith("data:")) return src;
  return `${API_BASE_URL}${src}`;
}