import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const u = username.trim().toLowerCase();
      if (mode === "login") {
        const user = await signIn(u, password);
        nav(user.role === "ADMIN" ? "/admin" : redirectTo, { replace: true });
      } else {
        const user = await signUp(u, password);
        nav(redirectTo, { replace: true });
      }
    } catch (e2) {
      setErr(e2.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden flex items-center justify-center py-12 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        body { font-family: 'Montserrat', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/40 to-rose-200/40 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-rose-200/40 to-orange-200/40 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ['rgba(251, 191, 36, 0.3)', 'rgba(251, 113, 133, 0.3)', 'rgba(249, 115, 22, 0.3)'][Math.floor(Math.random() * 3)]
              }, transparent)`,
              filter: 'blur(1px)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 border-2 border-amber-200/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          className="absolute bottom-20 left-20 w-48 h-48 border-2 border-rose-200/30"
          style={{ transform: 'rotate(45deg)' }}
          animate={{ rotate: 405 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Decorative Cake Icon */}
        <motion.div
          className="text-center mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        >
          <div className="inline-block relative">
            <motion.div
              className="text-7xl float-animation"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              🎂
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <div className="rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-xl p-8 shadow-2xl">
          {/* Mode Toggle */}
          <div className="relative flex gap-2 p-1 bg-gray-100 rounded-full">
            {/* Sliding Background */}
            <motion.div
              className="absolute top-1 h-[calc(100%-8px)] bg-gray-900 rounded-full shadow-lg"
              initial={false}
              animate={{
                left: mode === "login" ? "4px" : "calc(50%)",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <button
              className={`relative z-10 flex-1 rounded-full py-3 text-sm font-semibold transition-colors ${
                mode === "login" ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              className={`relative z-10 flex-1 rounded-full py-3 text-sm font-semibold transition-colors ${
                mode === "register" ? "text-white" : "text-gray-700"
              }`}
              onClick={() => setMode("register")}
            >
              Create Account
            </button>
          </div>

          {/* Header */}
          <motion.div
            key={mode}
            variants={slideIn}
            initial="hidden"
            animate="show"
            className="mt-8"
          >
            <h1 className="text-4xl font-serif font-medium text-gray-900">
              {mode === "login" ? "Welcome Back" : "Join Us"}
            </h1>
            <p className="mt-2 text-gray-600 font-light">
              {mode === "login"
                ? "Sign in to continue your sweet journey"
                : "Create an account to order delicious cakes"}
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {err && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{err}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>👤</span>
                Username
              </label>
              <div className="mt-2 relative">
                <input
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-light focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/10 transition-all"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </motion.div>

            <motion.div 
              variants={fadeUp} 
              initial="hidden" 
              animate="show"
              transition={{ delay: 0.1 }}
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>🔒</span>
                Password
              </label>
              <div className="mt-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 pr-12 font-light focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/10 transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
                
                {/* Show/Hide Password Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {mode === "register" && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-xs text-gray-500 flex items-center gap-1.5"
                >
                  <span>ℹ️</span>
                  Minimum 8 characters required
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-full bg-gray-900 px-8 py-4 text-white font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.2 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </>
                )}
              </span>
              
              {!loading && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          </form>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-4">
              <span className="text-2xl">👨‍💼</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Admin Access</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Administrators can sign in here using their admin credentials to access the management dashboard.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Decorative Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-sm text-gray-500 font-light"
        >
          🎂 Premium Artisan Bakery • Secure Authentication
        </motion.p>
      </motion.div>
    </div>
  );
}
