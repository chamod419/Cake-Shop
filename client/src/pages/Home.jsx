import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import resolveImage from "../utils/resolveImage";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function formatLKR(v) {
  const n = Number(v || 0);
  return `LKR ${n.toLocaleString()}`;
}

function safeImage(url) {
  const u = String(url || "").trim();
  return u || "https://placehold.co/900x600?text=Cake";
}

function pickFeatured(products, count = 6) {
  const copy = [...products];
  copy.sort((a, b) => {
    const ra = Number(a.rating || 0);
    const rb = Number(b.rating || 0);
    if (rb !== ra) return rb - ra;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
  return copy.slice(0, count);
}

// Enhanced animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideIn = {
  hidden: { x: -60, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-gray-900">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-lg text-gray-600 font-light max-w-2xl">
            {subtitle}
          </p>
        ) : null}
      </motion.div>
      {right}
    </div>
  );
}

function FeaturedCard({ p, index }) {
  const price = formatLKR(p.price);
  const rating = Number(p.rating || 0).toFixed(1);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.5,
      }}
      className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <motion.img
          src={safeImage(resolveImage(p.image))}
          alt={p.name}
          className="h-full w-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <motion.div
          className="absolute left-4 top-4 rounded-full bg-white/95 backdrop-blur-sm px-4 py-2 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <span className="text-sm font-semibold flex items-center gap-1.5">
            <span className="text-amber-500">⭐</span>
            <span className="text-gray-900">{rating}</span>
          </span>
        </motion.div>

        <div className="absolute right-4 top-4 rounded-full bg-gray-900/90 backdrop-blur-sm text-white px-4 py-2 text-xs font-medium tracking-wide uppercase shadow-lg">
          {p.category}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-xl font-medium text-gray-900 truncate mb-2">
              {p.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {p.description}
            </p>
          </div>
          <motion.div
            className="text-lg font-bold text-gray-900 whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
          >
            {price}
          </motion.div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 font-light">
            {(p.sizes || []).slice(0, 3).join(" • ")}
          </div>

          <Link
            to="/shop"
            className="group/btn relative overflow-hidden rounded-full bg-gray-900 px-6 py-2.5 text-white text-sm font-medium transition-all hover:bg-gray-800 hover:shadow-lg"
          >
            <span className="relative z-10">View Details</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ripples, setRipples] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 1000;

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
        if (alive) setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const featured = useMemo(() => pickFeatured(products, 6), [products]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
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

        <motion.div
          className="absolute w-64 h-64 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.06), rgba(251, 113, 133, 0.04), transparent)",
            filter: "blur(30px)",
          }}
          animate={{
            x: mousePos.x - 128,
            y: mousePos.y - 128,
          }}
          transition={{
            type: "spring",
            damping: 40,
            stiffness: 150,
            mass: 0.8,
          }}
        />

        {Array.from({ length: 30 }).map((_, i) => {
          const size = Math.random() * 6 + 2;
          const duration = Math.random() * 20 + 20;
          const delay = Math.random() * 10;

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
                    "rgba(251, 191, 36, 0.4)",
                    "rgba(251, 113, 133, 0.4)",
                    "rgba(249, 115, 22, 0.4)",
                    "rgba(168, 85, 247, 0.4)",
                  ][Math.floor(Math.random() * 4)]
                }, transparent)`,
                filter: "blur(1px)",
              }}
              animate={{
                y: ["100vh", "-10vh"],
                x: [0, Math.random() * 100 - 50],
                scale: [0, 1, 1, 0],
                opacity: [0, 0.6, 0.6, 0],
                rotate: [0, 360],
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        body { font-family: 'Montserrat', sans-serif; }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
        
        @keyframes scroll-fade {
          0% { opacity: 0; transform: translateY(-10px); }
          50% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
        
        @keyframes particles {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) translateX(var(--tx)) scale(0.5); opacity: 0; }
        }
        
        @keyframes mesh-gradient {
          0%, 100% { 
            background-position: 0% 50%;
            transform: rotate(0deg) scale(1);
          }
          25% { 
            background-position: 100% 50%;
            transform: rotate(90deg) scale(1.1);
          }
          50% { 
            background-position: 100% 100%;
            transform: rotate(180deg) scale(1);
          }
          75% { 
            background-position: 0% 100%;
            transform: rotate(270deg) scale(1.1);
          }
        }
        
        @keyframes float-wave {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(-10px) translateX(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.5); }
        }
        
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .interactive-bg {
          position: relative;
          overflow: hidden;
        }
        
        .interactive-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(251, 113, 133, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.02) 0%, transparent 50%);
          background-size: 200% 200%;
          animation: mesh-gradient 20s ease infinite;
          pointer-events: none;
          z-index: 0;
        }
        
        .interactive-bg > * {
          position: relative;
          z-index: 1;
        }
        
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.2), rgba(251, 113, 133, 0.1), transparent);
          transform: scale(0);
          animation: ripple-effect 1.5s ease-out;
          pointer-events: none;
        }
        
        @keyframes ripple-effect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 relative z-10"
        onClick={createRipple}
      >
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="ripple"
            style={{
              left: ripple.x - 50,
              top: ripple.y - 50,
              width: 100,
              height: 100,
            }}
          />
        ))}

        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div
            className="absolute w-96 h-96 rounded-full border border-amber-200/20"
            style={{ top: "10%", left: "5%" }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute w-64 h-64 rounded-full border-2 border-rose-200/20"
            style={{ top: "60%", right: "10%" }}
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.1, 0.05, 0.1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute w-48 h-48 border border-orange-200/20"
            style={{ top: "40%", left: "15%", transform: "rotate(45deg)" }}
            animate={{
              rotate: [45, 405],
              scale: [1, 1.3, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />

          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-amber-300/20 to-rose-300/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}

          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
            <motion.path
              d="M0,100 Q250,50 500,100 T1000,100 T1500,100 T2000,100"
              stroke="url(#gradient1)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d="M0,300 Q250,350 500,300 T1000,300 T1500,300 T2000,300"
              stroke="url(#gradient2)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(251, 191, 36)" />
                <stop offset="100%" stopColor="rgb(251, 113, 133)" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(251, 113, 133)" />
                <stop offset="100%" stopColor="rgb(249, 115, 22)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <motion.section
          className="relative overflow-hidden rounded-3xl"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50" />

          <motion.div
            className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/30 to-rose-200/30 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute -right-40 -bottom-40 w-96 h-96 rounded-full bg-gradient-to-br from-rose-200/30 to-orange-200/30 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative grid gap-12 p-8 md:p-16 lg:grid-cols-2 lg:items-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-gradient-to-br from-amber-400 to-rose-400"
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: "0%",
                    "--tx": `${(Math.random() - 0.5) * 200}px`,
                  }}
                  animate={{
                    y: [0, -viewportHeight],
                    x: [(Math.random() - 0.5) * 200],
                    scale: [1, Math.random() * 2 + 0.5, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 15,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "linear",
                  }}
                />
              ))}
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative z-10"
            >
              <motion.div
                variants={slideIn}
                className="inline-flex items-center gap-3 rounded-full bg-white/80 backdrop-blur-md px-5 py-3 shadow-lg border border-gray-200/50"
              >
                <span className="text-2xl">🎂</span>
                <span className="text-sm font-medium text-gray-700">
                  Artisan Bakery • Custom Designs • Same-Day Delivery
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-8 text-5xl md:text-7xl font-serif font-light tracking-tight text-gray-900 leading-tight"
              >
                Crafted with
                <motion.span
                  className="relative block mt-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  passion & precision
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full h-4"
                    viewBox="0 0 500 20"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                  >
                    <motion.path
                      d="M 0 10 Q 125 0, 250 10 T 500 10"
                      stroke="rgb(251, 191, 36)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </motion.span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg md:text-xl text-gray-600 font-light leading-relaxed max-w-xl"
              >
                Indulge in exquisite cakes made from premium ingredients.
                Each creation is a masterpiece designed to make your moments unforgettable.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/shop"
                  className="group relative overflow-hidden rounded-full bg-gray-900 px-8 py-4 text-white font-medium text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  <motion.span
                    className="relative z-10 flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    Explore Collection
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>

                <button
                  onClick={() => {
                    const el = document.getElementById("custom");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded-full border-2 border-gray-900 bg-white/50 backdrop-blur-sm px-8 py-4 font-medium text-lg text-gray-900 hover:bg-white hover:shadow-lg transition-all"
                >
                  Custom Orders
                </button>
              </motion.div>

              <motion.div
                variants={stagger}
                className="mt-12 grid grid-cols-3 gap-4"
              >
                {[
                  { value: "4.9★", label: "Customer Rating" },
                  { value: "2000+", label: "Happy Clients" },
                  { value: "24/7", label: "Support" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={scaleIn}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="rounded-2xl bg-white/80 backdrop-blur-sm p-5 text-center shadow-lg border border-gray-200/50"
                  >
                    <p className="text-2xl font-bold font-serif text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600 mt-1 font-light">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative perspective-1000"
            >
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotateZ: [0, 1, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=1400&auto=format&fit=crop"
                  alt="Premium cake"
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -bottom-8 -left-8 hidden lg:block"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="rounded-3xl bg-white/95 backdrop-blur-md p-6 shadow-2xl border border-gray-200/50 max-w-xs"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-sm font-semibold text-gray-900">Featured Today</p>
                  </div>
                  <p className="text-lg font-serif font-medium text-gray-900">Chocolate Truffle Delight</p>
                  <p className="text-sm text-gray-600 mt-1">Belgian chocolate • Fresh cream</p>
                  <Link
                    to="/shop"
                    className="mt-4 inline-block rounded-full bg-gray-900 px-5 py-2.5 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Order Now
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-sm font-light text-gray-600"
            >
              Scroll to explore
            </motion.div>

            <motion.div
              className="relative w-7 h-11 rounded-full border-2 border-gray-400 flex items-start justify-center p-1.5"
              whileHover={{ scale: 1.1, borderColor: "#000" }}
            >
              <motion.div
                className="w-1.5 h-2 rounded-full bg-gray-400"
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <div className="flex flex-col gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 h-2 bg-gray-400 rounded-full"
                  animate={{
                    opacity: [0, 1, 0],
                    scaleY: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.section>

        <section>
          <SectionTitle
            title="Signature Collection"
            subtitle="Handpicked creations that define excellence"
            right={
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                >
                  View All
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>
            }
          />

          {err && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-red-700"
            >
              <p className="font-medium">{err}</p>
            </motion.div>
          )}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="h-64 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                  <div className="mt-4 h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="mt-3 h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !err && (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {featured.map((p, i) => (
                <FeaturedCard key={p.id} p={p} index={i} />
              ))}
            </motion.div>
          )}
        </section>

        <section className="interactive-bg rounded-3xl bg-white border border-gray-100 p-12 shadow-lg">
          <SectionTitle
            title="Perfect for Every Occasion"
            subtitle="Find the ideal cake for your special moment"
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                title: "Birthdays",
                icon: "🎉",
                desc: "Colorful designs that celebrate joy",
                gradient: "from-pink-500/10 to-purple-500/10",
                hover: "group-hover:from-pink-500/20 group-hover:to-purple-500/20",
              },
              {
                title: "Weddings",
                icon: "💍",
                desc: "Elegant tiers for your special day",
                gradient: "from-rose-500/10 to-amber-500/10",
                hover: "group-hover:from-rose-500/20 group-hover:to-amber-500/20",
              },
              {
                title: "Celebrations",
                icon: "🥂",
                desc: "Mark milestones with sophistication",
                gradient: "from-blue-500/10 to-cyan-500/10",
                hover: "group-hover:from-blue-500/20 group-hover:to-cyan-500/20",
              },
              {
                title: "Kids Party",
                icon: "🧸",
                desc: "Whimsical themes they'll love",
                gradient: "from-orange-500/10 to-yellow-500/10",
                hover: "group-hover:from-orange-500/20 group-hover:to-yellow-500/20",
              },
            ].map((c) => (
              <motion.div key={c.title} variants={fadeUp}>
                <Link
                  to="/shop"
                  className={`group block rounded-3xl border-2 border-gray-200 bg-gradient-to-br ${c.gradient} ${c.hover} p-8 transition-all hover:border-gray-300 hover:shadow-xl hover:-translate-y-2`}
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="text-5xl mb-4"
                  >
                    {c.icon}
                  </motion.div>
                  <h3 className="font-serif text-2xl font-medium text-gray-900 mb-2">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {c.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-12 md:p-16">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <SectionTitle
            title={<span className="text-white">Why We're Different</span>}
            subtitle={
              <span className="text-gray-300">
                Excellence in every detail, from ingredients to delivery
              </span>
            }
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {[
              {
                icon: "🌟",
                title: "Premium Ingredients",
                desc: "Imported chocolate, organic flour, and farm-fresh dairy create unmatched flavor profiles.",
              },
              {
                icon: "🎨",
                title: "Artistic Excellence",
                desc: "Our designers transform your vision into edible art with precision and creativity.",
              },
              {
                icon: "⚡",
                title: "Swift & Reliable",
                desc: "Same-day delivery available with temperature-controlled packaging for perfect freshness.",
              },
            ].map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-8 hover:bg-white/20 transition-all"
              >
                <motion.div
                  className="text-5xl mb-5"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {b.icon}
                </motion.div>
                <h3 className="font-serif text-2xl font-medium text-white mb-3">
                  {b.title}
                </h3>
                <p className="text-gray-300 leading-relaxed font-light">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="interactive-bg rounded-3xl bg-white border border-gray-100 p-12 shadow-lg">
          <SectionTitle
            title="What Our Clients Say"
            subtitle="Stories from celebrations we've been honored to be part of"
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {[
              {
                name: "Nimal Perera",
                role: "Birthday Client",
                text: "The attention to detail was extraordinary. Our daughter's unicorn cake was even more beautiful than we imagined. Worth every rupee!",
                rating: 5,
              },
              {
                name: "Shalini Fernando",
                role: "Wedding Client",
                text: "Our 5-tier wedding cake was the centerpiece of our reception. The craftsmanship and taste exceeded all expectations.",
                rating: 5,
              },
              {
                name: "Ravi Wickramasinghe",
                role: "Corporate Client",
                text: "We order regularly for company events. Consistently exceptional quality and professional service every single time.",
                rating: 5,
              },
            ].map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-amber-500 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-600 font-light">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <motion.section
          id="custom"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-rose-500 to-orange-500 p-12 md:p-16 shadow-2xl"
        >
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
            animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="text-white">
              <motion.h2
                className="text-4xl md:text-5xl font-serif font-light tracking-tight mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                Dream It. We'll Create It.
              </motion.h2>
              <motion.p
                className="text-lg text-white/90 font-light leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                From concept sketches to the final masterpiece, our team brings your vision to life.
                Share your theme, preferences, and occasion details—we handle the rest with precision.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 lg:justify-end"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/shop"
                className="group relative overflow-hidden rounded-full bg-white text-gray-900 px-8 py-4 font-semibold text-center hover:shadow-2xl transition-all"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Browse Gallery
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
              <a
                href="https://wa.me/"
                className="rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-md text-white px-8 py-4 font-semibold text-center hover:bg-white/20 hover:border-white transition-all"
              >
                WhatsApp Consultation
              </a>
            </motion.div>
          </div>
        </motion.section>

        <motion.footer
          className="text-center py-12 border-t border-gray-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-gray-500 font-light">
            © {new Date().getFullYear()} CakeShop • Crafted with passion in Sri Lanka
          </p>
        </motion.footer>
      </div>
    </div>
  );
}