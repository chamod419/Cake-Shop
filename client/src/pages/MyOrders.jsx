import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyOrders } from "../api/orders";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
};

const stagger = {
  hidden: {},
  show: { 
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.05
    } 
  },
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

function Badge({ status }) {
  const statusConfig = {
    Pending: { 
      bg: "from-yellow-100 to-yellow-50", 
      text: "text-yellow-800", 
      border: "border-yellow-200",
      icon: "⏳",
      glow: "shadow-yellow-200/50"
    },
    Baking: { 
      bg: "from-blue-100 to-blue-50", 
      text: "text-blue-800", 
      border: "border-blue-200",
      icon: "👨‍🍳",
      glow: "shadow-blue-200/50"
    },
    Ready: { 
      bg: "from-green-100 to-green-50", 
      text: "text-green-800", 
      border: "border-green-200",
      icon: "✅",
      glow: "shadow-green-200/50"
    },
    Delivered: { 
      bg: "from-gray-100 to-gray-50", 
      text: "text-gray-800", 
      border: "border-gray-200",
      icon: "🎉",
      glow: "shadow-gray-200/50"
    },
    Cancelled: { 
      bg: "from-red-100 to-red-50", 
      text: "text-red-800", 
      border: "border-red-200",
      icon: "❌",
      glow: "shadow-red-200/50"
    },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <motion.span 
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 rounded-full bg-gradient-to-r ${config.bg} ${config.text} ${config.border} ${config.glow} shadow-lg`}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <span className="text-base">{config.icon}</span>
      {status}
    </motion.span>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ripples, setRipples] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState("All");

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await fetchMyOrders();
        setOrders(data);
      } catch (e) {
        setErr(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredOrders = filter === "All" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
          .font-serif { font-family: 'Cormorant Garamond', serif; }
          body { font-family: 'Montserrat', sans-serif; }
        `}</style>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="h-12 w-48 bg-gray-200 rounded-full animate-pulse" />
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div 
                key={i} 
                className="rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
          .font-serif { font-family: 'Cormorant Garamond', serif; }
          body { font-family: 'Montserrat', sans-serif; }
        `}</style>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-red-200 bg-red-50 p-12 text-center shadow-xl"
          >
            <p className="text-6xl mb-4">⚠️</p>
            <h2 className="text-3xl font-serif font-medium text-red-900 mb-2">Error Loading Orders</h2>
            <p className="text-red-700">{err}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!orders.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden" onClick={createRipple}>
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
        `}</style>

        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08), rgba(251, 113, 133, 0.06), transparent)',
              filter: 'blur(40px)',
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
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent)`,
                filter: 'blur(1px)',
              }}
              animate={{
                y: ['100vh', '-10vh'],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
                delay: Math.random() * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Ripples */}
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-12 text-center shadow-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="inline-block text-8xl mb-6"
            >
              📦
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4">
              No Orders Yet
            </h1>
            
            <p className="text-lg text-gray-600 font-light mb-8 max-w-md mx-auto">
              Start your sweet journey! Browse our collection and place your first order.
            </p>
            
            <Link 
              to="/shop" 
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gray-900 px-8 py-4 text-white font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                Browse Cakes
                <motion.span
                  animate={{ x: [0, 5, 0] }}
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
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden" onClick={createRipple}>
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
      `}</style>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08), rgba(251, 113, 133, 0.06), transparent)',
            filter: 'blur(40px)',
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
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${
                  ['rgba(251, 191, 36, 0.3)', 'rgba(251, 113, 133, 0.3)', 'rgba(249, 115, 22, 0.3)'][Math.floor(Math.random() * 3)]
                }, transparent)`,
                filter: 'blur(1px)',
              }}
              animate={{
                y: ['100vh', '-10vh'],
                x: [0, Math.random() * 100 - 50],
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration,
                delay: Math.random() * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          );
        })}

        {/* Geometric shape */}
        <motion.div
          className="absolute w-96 h-96 rounded-full border border-amber-200/20"
          style={{ top: '20%', left: '10%' }}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Ripples */}
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-5 py-2 shadow-lg border border-gray-200/50 mb-4">
            <span className="text-xl">📦</span>
            <span className="text-sm font-medium text-gray-700">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-light tracking-tight text-gray-900 mb-4">
            My Orders
          </h1>

          <p className="text-lg text-gray-600 font-light max-w-2xl">
            Track your delicious orders from our kitchen to your celebration
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {['All', 'Pending', 'Baking', 'Ready', 'Delivered', 'Cancelled'].map((status) => {
            const count = status === 'All' ? orders.length : (statusCounts[status] || 0);
            return (
              <motion.button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-6 py-3 font-medium transition-all ${
                  filter === status
                    ? "bg-gray-900 text-white shadow-lg"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status}
                {count > 0 && (
                  <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${
                    filter === status ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Orders List */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((o) => (
              <motion.div
                key={o.id}
                variants={fadeUp}
                layout
                exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                className="group rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-xl transition-all"
                whileHover={{ y: -4 }}
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-serif text-3xl font-medium text-gray-900 mb-2">
                      Order #{o.id.slice(-6).toUpperCase()}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 font-light">
                      <span className="flex items-center gap-1.5">
                        <span className="text-amber-500">📍</span>
                        {o.type}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-blue-500">📅</span>
                        {o.date}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-rose-500">🕐</span>
                        {o.time}
                      </span>
                    </div>
                  </div>
                  <Badge status={o.status} />
                </div>

                {/* Order Items */}
                <div className="mb-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white p-6 border border-gray-100">
                  <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">🎂</span>
                    Order Items
                  </p>
                  <div className="space-y-3">
                    {o.items.map((it) => (
                      <motion.div 
                        key={it.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        whileHover={{ x: 5 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="font-medium text-gray-900">{it.name}</span>
                          <span className="text-gray-500 text-sm">× {it.qty}</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          Rs. {(it.price * it.qty).toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-gray-100">
                  <motion.div 
                    className="flex items-baseline gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-gray-600 font-light">Total:</span>
                    <span className="text-3xl font-bold text-gray-900">
                      Rs. {o.total.toLocaleString()}
                    </span>
                  </motion.div>

                  <Link 
                    to={`/order-success/${o.id}`} 
                    className="group/btn relative overflow-hidden rounded-full border-2 border-gray-900 bg-white px-6 py-3 font-semibold hover:shadow-lg transition-all"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      View Details
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                    <motion.div 
                      className="absolute inset-0 bg-gray-900"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover/btn:opacity-100 transition-opacity">
                      View Details →
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty filtered state */}
        {filteredOrders.length === 0 && filter !== 'All' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-12 text-center shadow-lg"
          >
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="text-2xl font-serif font-medium text-gray-900 mb-2">
              No {filter} Orders
            </h3>
            <p className="text-gray-600 font-light mb-6">
              You don't have any orders with "{filter}" status
            </p>
            <button
              onClick={() => setFilter('All')}
              className="rounded-full bg-gray-900 px-6 py-3 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              View All Orders
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
