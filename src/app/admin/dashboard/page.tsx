"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Package,
  ArrowUpRight,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Truck,
  MoreHorizontal,
  Plus,
  FileText,
  Ticket,
  Eye,
  Activity,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface DashboardData {
  stats: {
    revenue: {
      total: number;
      today: number;
      month: number;
    };
    orders: { total: number; pending: number };
    products: { total: number; lowStock: number; outOfStock: number };
    customers: number;
  };
  stockAlerts: {
    low: any[];
    out: any[];
  };
  salesTrend: { date: string; amount: number; orders: number }[];
  recentOrders: any[];
  topProducts: {
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }[];
}

export default function AdminDashboard() {
  const { data: session } = authClient.useSession();
  const role = (session?.user as any)?.role || "admin";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">(
    "week",
  );
  const [chartHovered, setChartHovered] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/admin/stats?range=${dateRange}`);
        const stats = await res.json();
        if (res.ok) {
          setData(stats);
        } else {
          console.error("Failed to fetch stats:", stats.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dateRange]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#C6A75E] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h3 className="text-2xl font-bold text-[#2F3E2C] mb-2 whitespace-nowrap">
          Unable to load dashboard
        </h3>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#2F3E2C] text-white rounded-lg font-bold shadow-md hover:bg-[#1f2b1d] transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#2F3E2C] tracking-tight">
            Business Overview
          </h1>
          <p className="text-gray-400 mt-2 font-medium flex items-center gap-2 tracking-wide">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live insights for{" "}
            <span className="text-[#2F3E2C] font-black">Sai Nandhini</span>
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          {(["today", "week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === r ? "bg-[#2F3E2C] text-white shadow-md" : "text-gray-400 hover:text-[#2F3E2C]"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      {/* KPI Cards */}
      {(role === "admin" || role === "staff") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={60} className="text-[#2F3E2C]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#2F3E2C]/5 text-[#2F3E2C] rounded-2xl">
                  <TrendingUp size={20} />
                </div>
                <span className="bg-green-50 text-green-700 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                  <ArrowUpRight size={10} /> +12.5%
                </span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#2F3E2C]">
                {formatCurrency(data.stats.revenue.total)}
              </h3>
            </div>
          </motion.div>

          {/* Orders */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShoppingBag size={60} className="text-[#C6A75E]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#C6A75E]/10 text-[#C6A75E] rounded-2xl">
                  <ShoppingBag size={20} />
                </div>
                <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-1 rounded-full">
                  {data.stats.orders.pending} Pending
                </span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#2F3E2C]">
                {data.stats.orders.total}
              </h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                Total Orders
              </p>
            </div>
          </motion.div>

          {/* Products */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={60} className="text-[#2F3E2C]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#2F3E2C]/5 text-[#2F3E2C] rounded-2xl">
                  <Package size={20} />
                </div>
                {(data.stats.products.lowStock > 0 ||
                  data.stats.products.outOfStock > 0) && (
                  <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                    Action Needed
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#2F3E2C]">
                {data.stats.products.total}
              </h3>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Catalog Size
                </span>
                {data.stats.products.lowStock > 0 && (
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">
                    • {data.stats.products.lowStock} Low
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Customers */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users size={60} className="text-[#C6A75E]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#C6A75E]/10 text-[#C6A75E] rounded-2xl">
                  <Users size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-serif font-bold text-[#2F3E2C]">
                {data.stats.customers}
              </h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                Total Customers
              </p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2F3E2C]">
                  Performance Velocity
                </h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                  Revenue Trend
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.salesTrend}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6A75E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C6A75E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F1F1F1"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, "auto"]} />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#2F3E2C] text-white p-3 rounded-xl shadow-2xl border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#C6A75E] mb-1">
                              {payload[0].payload.date}
                            </p>
                            <div className="flex justify-between gap-4 text-xs font-bold">
                              <span>Revenue:</span>
                              <span>
                                {formatCurrency(payload[0].value as number)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4 text-[10px] text-white/60 mt-0.5">
                              <span>Orders:</span>
                              <span>{payload[0].payload.orders}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#C6A75E"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2F3E2C]">
                  Order Log
                </h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                  Recent Transactions
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="p-3 rounded-full hover:bg-gray-50 text-gray-400 hover:text-[#2F3E2C] transition-all"
              >
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentOrders.map((order, i) => {
                    return (
                      <tr
                        key={order._id}
                        className="group hover:bg-[#F8F6F2]/50 transition-colors"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#2F3E2C] text-[10px] font-black border border-gray-100">
                              {(order.shippingAddress?.fullName || "G")[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#2F3E2C] truncate max-w-[120px]">
                                {order.shippingAddress?.fullName || "Guest"}
                              </p>
                              <p className="text-[9px] text-gray-400 font-medium">
                                #{order._id.slice(-6).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm font-serif font-bold text-[#2F3E2C]">
                          {formatCurrency(order.totalPrice)}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              order.status === "Delivered"
                                ? "bg-green-50 text-green-700"
                                : order.status === "Processing"
                                  ? "bg-blue-50 text-blue-700"
                                  : order.status === "Shipping"
                                    ? "bg-orange-50 text-orange-700"
                                    : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button className="text-gray-300 hover:text-[#2F3E2C] transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar widgets */}
        <div className="space-y-8">
          {/* User Card */}
          <div className="bg-[#2F3E2C] p-8 rounded-[24px] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6A75E] opacity-10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-xl font-serif font-bold mb-4">
                {session?.user?.name?.[0] || "A"}
              </div>
              <h3 className="text-xl font-serif font-bold">
                {session?.user?.name || "Administrator"}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-white/60 mt-1">
                Super User Access
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
            <h4 className="text-sm font-black uppercase tracking-widest text-[#2F3E2C] mb-6">
              Mission Control
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: Plus,
                  label: "Add Item",
                  href: "/admin/products",
                  color: "text-blue-500 bg-blue-50",
                },

                {
                  icon: Ticket,
                  label: "Promo",
                  href: "/admin/coupons",
                  color: "text-pink-500 bg-pink-50",
                },
                {
                  icon: Eye,
                  label: "Analytics",
                  href: "/admin/analytics",
                  color: "text-orange-500 bg-orange-50",
                },
              ].map((act, i) => (
                <Link
                  key={i}
                  href={act.href}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-[#C6A75E]/30 hover:shadow-md transition-all flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`p-2 rounded-xl ${act.color} group-hover:scale-110 transition-transform`}
                  >
                    <act.icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                    {act.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {(data.stockAlerts.low.length > 0 ||
            data.stockAlerts.out.length > 0) && (
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-[#2F3E2C]">
                  Alerts
                </h4>
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <div className="space-y-3">
                {data.stockAlerts.out.slice(0, 3).map((item: any) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-50"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg overflow-hidden shrink-0">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0]}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-[#2F3E2C] truncate">
                        {item.name}
                      </p>
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                        Out of Stock
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
