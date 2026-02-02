import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import resolveImage from "../utils/resolveImage";
import { money } from "../utils/pricing";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  },
  exit: {
    opacity: 0,
    x: -100,
    filter: "blur(4px)",
    transition: { duration: 0.4 }
  }
};

const stagger = {
  hidden: {},
  show: { 
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.05
    } 
  },
};

function keyOf(item) {
  return `${item.productId}|${item.size || ""}|${item.flavor || ""}`;
}

export default function Cart() {
  const cart = useCart();
  const [ripples, setRipples] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [removedItems, setRemovedItems] = useState(new Set());

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

  const handleRemove = (key) => {
    setRemovedItems((prev) => new Set([...prev, key]));
    setTimeout(() => {
      cart.remove(key);
      setRemovedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 400);
  };

  const handleClearCart = () => {
    cart.items.forEach(item => {
      const k = keyOf(item);
      setRemovedItems((prev) => new Set([...prev, k]));
    });
    setTimeout(() => {
      cart.clear();
      setRemovedItems(new Set());
    }, 600);
  };

  const subtotal = cart.items.reduce((sum, it) => {
    const unit = Number(it.unitPrice ?? it.price ?? 0);
    return sum + unit * Number(it.qty || 0);
  }, 0);

  const totalItems = cart.items.reduce((sum, it) => sum + Number(it.qty || 0), 0);

  // Empty cart state
  if (!cart.items.length) {
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
              🛒
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            
            <p className="text-lg text-gray-600 font-light mb-8 max-w-md mx-auto">
              Looks like you haven't added any delicious cakes yet. Let's change that!
            </p>
            
            <Link 
              to="/shop" 
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gray-900 px-8 py-4 text-white font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Our Collection
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

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
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
          className="absolute w-80 h-80 rounded-full border border-rose-200/20"
          style={{ top: '30%', right: '5%' }}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-5 py-2 shadow-lg border border-gray-200/50 mb-4">
                <span className="text-xl">🛒</span>
                <span className="text-sm font-medium text-gray-700">
                  {totalItems} {totalItems === 1 ? 'Item' : 'Items'} in Cart
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-serif font-light tracking-tight text-gray-900">
                Shopping Cart
              </h1>
            </div>

            <motion.button
              onClick={handleClearCart}
              className="group relative overflow-hidden rounded-full border-2 border-red-200 bg-white/80 backdrop-blur-sm px-6 py-3 text-red-600 font-medium hover:border-red-300 hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>🗑️</span>
                Clear Cart
              </span>
            </motion.button>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <motion.div 
            className="lg:col-span-2 space-y-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence mode="popLayout">
              {cart.items.map((it) => {
                const k = keyOf(it);
                const unit = Number(it.unitPrice ?? it.price ?? 0);
                const qty = Math.max(1, Number(it.qty || 1));
                const lineTotal = unit * qty;
                const isRemoving = removedItems.has(k);

                return (
                  <motion.div
                    key={k}
                    variants={fadeUp}
                    layout
                    exit={{ 
                      opacity: 0, 
                      x: -100,
                      height: 0,
                      marginBottom: 0,
                      transition: { duration: 0.4 }
                    }}
                    className={`group rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all ${
                      isRemoving ? 'opacity-50' : ''
                    }`}
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <motion.div 
                        className="relative h-32 w-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shrink-0 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img 
                          src={resolveImage(it.image)} 
                          alt={it.name} 
                          className="h-full w-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="font-serif text-2xl font-medium text-gray-900 mb-2">
                              {it.name}
                            </h3>
                            
                            {/* Size and Flavor Tags */}
                            <div className="flex flex-wrap gap-2 mb-2">
                              {it.size && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
                                  <span>📏</span>
                                  {it.size}
                                </span>
                              )}
                              {it.flavor && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-medium text-rose-800">
                                  <span>🎂</span>
                                  {it.flavor}
                                </span>
                              )}
                            </div>

                            {/* Unit Price */}
                            {unit === 0 ? (
                              <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                                <span>⚠️</span>
                                Price not set
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600 font-light">
                                {money(unit)} per item
                              </p>
                            )}
                          </div>

                          <motion.button
                            onClick={() => handleRemove(k)}
                            className="rounded-full p-2 text-red-500 hover:bg-red-50 transition-colors"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <motion.button 
                              className="rounded-full bg-gray-100 hover:bg-gray-200 w-10 h-10 flex items-center justify-center font-bold text-gray-700 transition-colors"
                              onClick={() => cart.setQty(k, Math.max(1, qty - 1))}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              −
                            </motion.button>

                            <input
                              className="w-16 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-center font-semibold focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                              type="number"
                              min={1}
                              max={99}
                              value={qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                cart.setQty(k, Math.max(1, Math.min(99, val)));
                              }}
                              onBlur={(e) => {
                                if (!e.target.value || parseInt(e.target.value) < 1) {
                                  cart.setQty(k, 1);
                                }
                              }}
                            />

                            <motion.button 
                              className="rounded-full bg-gray-100 hover:bg-gray-200 w-10 h-10 flex items-center justify-center font-bold text-gray-700 transition-colors"
                              onClick={() => cart.setQty(k, qty + 1)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              +
                            </motion.button>
                          </div>

                          {/* Line Total */}
                          <motion.div 
                            className="text-right"
                            key={lineTotal}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p className="text-sm text-gray-500 font-light">Subtotal</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {money(lineTotal)}
                            </p>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <div className="rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-8 shadow-xl">
              <h2 className="text-3xl font-serif font-medium text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-light">Items ({totalItems})</span>
                  <span className="font-semibold text-gray-900">
                    {money(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-light">Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>

                <motion.div 
                  className="flex justify-between items-center py-4 bg-gradient-to-r from-amber-50 to-rose-50 -mx-8 px-8 rounded-2xl"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-gray-900">
                    {money(subtotal)}
                  </span>
                </motion.div>
              </div>

              <Link 
                to="/checkout" 
                className={`group relative block w-full text-center overflow-hidden rounded-full px-8 py-4 font-semibold shadow-xl transition-all mb-4 ${
                  subtotal > 0 
                    ? 'bg-gray-900 text-white hover:shadow-2xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (subtotal <= 0) {
                    e.preventDefault();
                    alert('Cannot checkout with zero total. Please check product prices.');
                  }
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {subtotal > 0 ? 'Proceed to Checkout' : 'Cannot Checkout'}
                  {subtotal > 0 && (
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  )}
                </span>
                {subtotal > 0 && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>

              <Link 
                to="/shop" 
                className="block text-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">✓</span>
                  <span className="font-light">Secure payment processing</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">🚚</span>
                  <span className="font-light">Free delivery on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-xl">💯</span>
                  <span className="font-light">Satisfaction guaranteed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
