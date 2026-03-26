import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

import resolveImage from "../utils/resolveImage";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ resolve uploaded/local image paths correctly
// function resolveImage(src) {
//   if (!src) return "https://placehold.co/900x600?text=Cake";
//   if (src.startsWith("http")) return src; // external links
//   if (src.startsWith("data:")) return src; // base64 images
//   // backend saved "/uploads/xxx.jpg" -> must load from backend host
//   return `${API_BASE_URL}${src}`;
// }

/* ✅ NEW: weight + price helpers (price adjusts by selected size) */
function parseWeightKg(sizeLabel) {
  if (!sizeLabel) return 1;
  const m = String(sizeLabel).match(/([\d.]+)\s*kg/i);
  const kg = m ? Number(m[1]) : 1;
  return Number.isFinite(kg) && kg > 0 ? kg : 1;
}

function calcPriceBySize(product, sizeLabel) {
  // assume product.price = 1kg price
  const base = Number(product?.price ?? 0);
  const kg = parseWeightKg(sizeLabel);
  return Math.round(base * kg);
}

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(4px)",
    transition: { duration: 0.3 },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export default function Shop() {
  const { addToCart } = useCart();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ripples, setRipples] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [addedItems, setAddedItems] = useState(new Set());

  /* ✅ NEW: keep selected size/flavor per product without changing your UI layout */
  const [selected, setSelected] = useState({}); 
  // selected[productId] = { size: "1kg", flavor: "Chocolate" }

  const getSelectedSize = (p) =>
    selected[p.id]?.size ?? (p.sizes?.[0] || null);

  const getSelectedFlavor = (p) =>
    selected[p.id]?.flavor ?? (p.flavors?.[0] || null);

  const setSelectedSize = (pid, size) => {
    setSelected((prev) => ({ ...prev, [pid]: { ...(prev[pid] || {}), size } }));
  };

  const setSelectedFlavor = (pid, flavor) => {
    setSelected((prev) => ({
      ...prev,
      [pid]: { ...(prev[pid] || {}), flavor },
    }));
  };

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Ripple effect on click
  const createRipple = (e) => {
    const ripple = {
      x: e.clientX,
      y: e.clientY,
      id: Date.now(),
    };
    setRipples((prev) => [...prev, ripple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 1500);
  };

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load products");
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message || "Unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return items.filter((p) => {
      const catOk = category === "All" || p.category === category;
      const qOk =
        !query ||
        String(p.name).toLowerCase().includes(query) ||
        String(p.description).toLowerCase().includes(query);
      return catOk && qOk && p.isAvailable !== false;
    });
  }, [items, q, category]);

  /* ✅ UPDATED: add correct price + selected size/flavor to cart */
  function handleAdd(p) {
    const size = getSelectedSize(p);
    const flavor = getSelectedFlavor(p);
    const finalPrice = calcPriceBySize(p, size);

    addToCart({
      id: p.id,
      name: p.name,
      // ✅ price becomes size-based
      price: finalPrice,
      // ✅ keep your image resolving logic
      image: resolveImage(p.image),
      category: p.category,
      qty: 1,
      // ✅ NEW: store selection (useful for checkout/order)
      size: size || null,
      flavor: flavor || null,
    });

    // Add visual feedback
    setAddedItems((prev) => new Set([...prev, p.id]));
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(p.id);
        return newSet;
      });
    }, 2000);
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
      onClick={createRipple}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        body { font-family: 'Montserrat', sans-serif; }
        
        @keyframes ripple-effect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.3), rgba(251, 113, 133, 0.2), transparent);
          transform: scale(0);
          animation: ripple-effect 1.5s ease-out;
          pointer-events: none;
        }
        
        @keyframes float-badge {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-5px) scale(1.05); }
        }
        
        .added-badge {
          animation: float-badge 0.6s ease-in-out;
        }
      `}</style>

      {/* Mouse follower glow effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.08), rgba(251, 113, 133, 0.06), transparent)",
            filter: "blur(40px)",
          }}
          animate={{
            x: mousePos.x - 192,
            y: mousePos.y - 192,
          }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 200,
            mass: 0.5,
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => {
          const size = Math.random() * 4 + 2;
          const duration = Math.random() * 15 + 15;
          const delay = Math.random() * 5;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${
                  [
                    "rgba(251, 191, 36, 0.3)",
                    "rgba(251, 113, 133, 0.3)",
                    "rgba(249, 115, 22, 0.3)",
                  ][Math.floor(Math.random() * 3)]
                }, transparent)`,
                filter: "blur(1px)",
              }}
              animate={{
                y: ["100vh", "-10vh"],
                x: [0, Math.random() * 100 - 50],
                scale: [0, 1, 1, 0],
                opacity: [0, 0.6, 0.6, 0],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}
      </div>

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100,
            zIndex: 50,
          }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-5 py-2 shadow-lg border border-gray-200/50 mb-4"
              >
                <span className="text-xl">🛍️</span>
                <span className="text-sm font-medium text-gray-700">
                  {filtered.length} Premium Cakes Available
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl font-serif font-light tracking-tight text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Our Collection
              </motion.h1>

              <motion.p
                className="mt-3 text-lg text-gray-600 font-light max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Handcrafted with premium ingredients, each cake is a masterpiece waiting for your celebration
              </motion.p>
            </div>

            {/* Search and Filter Controls */}
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-fit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative">
                <input
                  className="w-full sm:w-64 rounded-full border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-5 py-3 pl-12 font-light focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                  placeholder="Search cakes..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  🔍
                </span>
              </div>

              <select
                className="rounded-full border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-5 py-3 font-medium focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="rounded-3xl border-2 border-gray-200 bg-white p-4 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                <div className="mt-4 h-6 w-2/3 bg-gray-200 rounded-full animate-pulse" />
                <div className="mt-3 h-4 w-1/3 bg-gray-200 rounded-full animate-pulse" />
                <div className="mt-4 h-10 w-full bg-gray-200 rounded-full animate-pulse" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Error State */}
        {err && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-red-200 bg-red-50 p-8 text-center shadow-lg"
          >
            <p className="text-2xl mb-2">⚠️</p>
            <p className="text-red-700 font-medium">{err}</p>
          </motion.div>
        )}

        {/* Products Grid */}
        {!loading && !err && filtered.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => {
                const selectedSize = getSelectedSize(p);
                const selectedFlavor = getSelectedFlavor(p);
                const displayPrice = calcPriceBySize(p, selectedSize);

                return (
                  <motion.div
                    key={p.id}
                    variants={fadeUp}
                    layout
                    className="group relative rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    {/* Added to Cart Badge */}
                    <AnimatePresence>
                      {addedItems.has(p.id) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0, y: -20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0, y: -20 }}
                          className="absolute top-4 right-4 z-20 rounded-full bg-green-500 px-4 py-2 shadow-xl"
                        >
                          <span className="text-white text-sm font-semibold flex items-center gap-2">
                            ✓ Added!
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Image Section */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <motion.img
                        src={resolveImage(p.image)}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/900x600?text=Cake";
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Rating Badge */}
                      <motion.div
                        className="absolute left-4 top-4 rounded-full bg-white/95 backdrop-blur-sm px-4 py-2 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <span className="text-sm font-semibold flex items-center gap-1.5">
                          <span className="text-amber-500">⭐</span>
                          <span className="text-gray-900">{p.rating}</span>
                        </span>
                      </motion.div>

                      {/* Category Badge */}
                      <div className="absolute right-4 top-4 rounded-full bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 text-xs font-medium tracking-wide uppercase shadow-lg">
                        {p.category}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-serif text-2xl font-medium text-gray-900 line-clamp-1">
                          {p.name}
                        </h3>

                        {/* ✅ UPDATED: show adjusted price (design unchanged) */}
                        <motion.div
                          className="text-xl font-bold text-gray-900 whitespace-nowrap"
                          whileHover={{ scale: 1.05 }}
                        >
                          LKR {Number(displayPrice || 0).toLocaleString()}
                        </motion.div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4 font-light">
                        {p.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 mb-5 text-xs text-gray-600 font-light">
                        {/* ✅ UPDATED: size selector (still same section, same feel) */}
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500">📏</span>
                          <span className="font-medium">Sizes:</span>

                          <select
                            className="ml-auto rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400/20 cursor-pointer"
                            value={selectedSize || ""}
                            onChange={(e) => setSelectedSize(p.id, e.target.value)}
                          >
                            {(p.sizes?.length ? p.sizes : ["1kg"]).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* ✅ UPDATED: flavor selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-rose-500">🎂</span>
                          <span className="font-medium">Flavors:</span>

                          <select
                            className="ml-auto rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400/20 cursor-pointer"
                            value={selectedFlavor || ""}
                            onChange={(e) => setSelectedFlavor(p.id, e.target.value)}
                          >
                            {(p.flavors?.length ? p.flavors : ["Classic"]).map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <motion.button
                        onClick={() => handleAdd(p)}
                        className="group/btn relative overflow-hidden w-full rounded-full bg-gray-900 px-6 py-3.5 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <span>Add to Cart</span>
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Category Quick Filters */}
        {!loading && !err && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap gap-3 justify-center"
          >
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-6 py-2.5 font-medium transition-all ${
                  category === cat
                    ? "bg-gray-900 text-white shadow-lg"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
