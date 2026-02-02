import { useEffect, useState } from "react";
import { adminFetchOrders, adminUpdateOrderStatus } from "../api/admin";
import { motion, AnimatePresence } from "framer-motion";

const STATUSES = ["Pending", "Accepted", "Baking", "Ready", "Delivered", "Cancelled"];

// Status configuration with colors and icons
const STATUS_CONFIG = {
  Pending: { 
    bg: "from-yellow-100 to-yellow-50", 
    text: "text-yellow-800", 
    border: "border-yellow-200",
    icon: "⏳",
    dotColor: "bg-yellow-500"
  },
  Accepted: { 
    bg: "from-blue-100 to-blue-50", 
    text: "text-blue-800", 
    border: "border-blue-200",
    icon: "✅",
    dotColor: "bg-blue-500"
  },
  Baking: { 
    bg: "from-purple-100 to-purple-50", 
    text: "text-purple-800", 
    border: "border-purple-200",
    icon: "👨‍🍳",
    dotColor: "bg-purple-500"
  },
  Ready: { 
    bg: "from-green-100 to-green-50", 
    text: "text-green-800", 
    border: "border-green-200",
    icon: "🎉",
    dotColor: "bg-green-500"
  },
  Delivered: { 
    bg: "from-gray-100 to-gray-50", 
    text: "text-gray-800", 
    border: "border-gray-200",
    icon: "📦",
    dotColor: "bg-gray-500"
  },
  Cancelled: { 
    bg: "from-red-100 to-red-50", 
    text: "text-red-800", 
    border: "border-red-200",
    icon: "❌",
    dotColor: "bg-red-500"
  },
};

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const stagger = {
  hidden: {},
  show: { 
    transition: { 
      staggerChildren: 0.05
    } 
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  
  return (
    <motion.div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border-2 bg-gradient-to-r ${config.bg} ${config.text} ${config.border}`}
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-sm">{config.icon}</span>
      {status}
    </motion.div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const data = await adminFetchOrders();
      setOrders(data);
    } catch (e) {
      setErr(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(orderId, newStatus) {
    try {
      setErr("");
      setUpdatingOrderId(orderId);
      await adminUpdateOrderStatus(orderId, newStatus);
      await load();
    } catch (e) {
      setErr(e.message || "Failed to update");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Status counts
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        body { font-family: 'Montserrat', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <span className="text-xl">📊</span>
                <span className="text-sm font-medium text-gray-700">
                  {orders.length} Total Orders
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-serif font-light tracking-tight text-gray-900">
                Order Management
              </h1>
              <p className="mt-2 text-lg text-gray-600 font-light">
                Track and manage all customer orders in real-time
              </p>
            </div>

            <motion.button
              onClick={load}
              disabled={loading}
              className="group relative overflow-hidden rounded-full bg-gray-900 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    🔄 Refresh
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {["Pending", "Accepted", "Baking", "Ready", "Delivered", "Cancelled"].map((status) => {
            const config = STATUS_CONFIG[status];
            const count = statusCounts[status] || 0;
            
            return (
              <motion.div
                key={status}
                variants={fadeUp}
                className={`rounded-2xl border-2 bg-gradient-to-br ${config.bg} ${config.border} p-4 cursor-pointer hover:shadow-lg transition-all`}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setFilterStatus(status)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{config.icon}</span>
                  <motion.div
                    className={`w-2 h-2 rounded-full ${config.dotColor}`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <p className={`text-3xl font-bold ${config.text}`}>{count}</p>
                <p className={`text-xs font-medium ${config.text} mt-1`}>{status}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by order ID, customer, phone, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-5 py-3 pl-12 font-light focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              🔍
            </span>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-5 py-3 font-medium focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {err && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-6 overflow-hidden"
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

        {/* Orders Table/Cards */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-3xl border-2 border-gray-200 bg-white p-6"
              >
                <div className="animate-pulse space-y-3">
                  <div className="h-6 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-64 bg-gray-200 rounded" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : !filteredOrders.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-12 text-center"
          >
            <p className="text-6xl mb-4">📦</p>
            <h3 className="text-2xl font-serif font-medium text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600">
              {filterStatus !== "All" ? `No orders with status "${filterStatus}"` : "No orders in the system yet"}
            </p>
            {filterStatus !== "All" && (
              <button
                onClick={() => setFilterStatus("All")}
                className="mt-4 rounded-full bg-gray-900 px-6 py-2 text-white font-medium hover:bg-gray-800 transition-colors"
              >
                View All Orders
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-3xl border-2 border-gray-200 bg-white shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <AnimatePresence mode="popLayout">
                      {filteredOrders.map((o, index) => (
                        <motion.tr
                          key={o.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-bold text-gray-900">
                              #{o.id.slice(-6).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{o.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <span>📱</span>
                              {o.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-sm text-blue-800">
                              <span>👤</span>
                              {o.user?.username || "Guest"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                              {o.type === "Delivery" ? "🚚" : "🏪"}
                              {o.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <span>📅</span>
                              {o.date}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span>🕐</span>
                              {o.time}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-gray-900">
                              Rs. {Number(o.total).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <select
                                value={o.status}
                                onChange={(e) => updateStatus(o.id, e.target.value)}
                                disabled={updatingOrderId === o.id}
                                className="appearance-none rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 pr-10 text-sm font-medium focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                {updatingOrderId === o.id ? (
                                  <motion.div
                                    className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                ) : (
                                  <span className="text-gray-400">▼</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="lg:hidden space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((o) => (
                  <motion.div
                    key={o.id}
                    variants={fadeUp}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-3xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="font-mono text-lg font-bold text-gray-900">
                          #{o.id.slice(-6).toUpperCase()}
                        </span>
                        <div className="mt-1">
                          <StatusBadge status={o.status} />
                        </div>
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        Rs. {Number(o.total).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">Customer:</span>
                        <span className="font-semibold text-gray-900">{o.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">Phone:</span>
                        <span className="text-gray-700">{o.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">User:</span>
                        <span className="text-gray-700">{o.user?.username || "Guest"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">Type:</span>
                        <span className="text-gray-700">{o.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-20">Date:</span>
                        <span className="text-gray-700">{o.date} {o.time}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Update Status:
                      </label>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        disabled={updatingOrderId === o.id}
                        className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
