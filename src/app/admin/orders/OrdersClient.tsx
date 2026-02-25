"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  FileText,
  ChevronDown,
  X,
  Calendar,
  CheckCircle,
  AlertCircle,
  Package,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Wallet,
  PackageCheck,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

const ORDER_STAGES = ["Pending", "Processing", "Shipping", "Delivered"];

export default function OrdersClient({
  initialOrders,
}: {
  initialOrders: any[];
}) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [orders, setOrders] = useState<any[]>(
    initialOrders.map((order: any) => ({
      ...order,
      status: order.status || (order.isDelivered ? "Delivered" : "Pending"),
    })),
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateRange, setDateRange] = useState("AllTime");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      const normalizedData = data.map((order: any) => ({
        ...order,
        status: order.status || (order.isDelivered ? "Delivered" : "Pending"),
      }));
      setOrders(normalizedData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const previousOrders = [...orders];
    setOrders(
      orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
    );

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      setOrders(previousOrders);
      toast.error("Failed to update status");
    }
  };

  const handlePaymentStatusChange = async (orderId: string, isPaid: boolean) => {
    const previousOrders = [...orders];
    setOrders(
      orders.map((o) =>
        o._id === orderId
          ? { ...o, isPaid, paidAt: isPaid ? new Date() : null }
          : o,
      ),
    );

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid, paidAt: isPaid ? new Date() : null }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Payment status updated to ${isPaid ? "Paid" : "Unpaid"}`);
    } catch (err) {
      setOrders(previousOrders);
      toast.error("Failed to update payment status");
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;

    const previousOrders = [...orders];
    setOrders(
      orders.map((o) =>
        selectedOrders.includes(o._id) ? { ...o, status: newStatus } : o,
      ),
    );

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: selectedOrders, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        `Bulk updated ${selectedOrders.length} orders to ${newStatus}`,
      );
      setSelectedOrders([]);
    } catch (err) {
      setOrders(previousOrders);
      toast.error("Bulk update failed");
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o._id));
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (order.shippingAddress.phone &&
          order.shippingAddress.phone.includes(searchTerm));

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;
      const matchesPayment =
        paymentFilter === "All" ||
        (paymentFilter === "Paid" ? order.isPaid : !order.isPaid);

      let matchesDate = true;
      if (dateRange !== "AllTime") {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        if (dateRange === "Today") {
          matchesDate = orderDate.toDateString() === today.toDateString();
        } else if (dateRange === "Week") {
          const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= lastWeek;
        } else if (dateRange === "Month") {
          const lastMonth = new Date(
            today.getTime() - 30 * 24 * 60 * 60 * 1000,
          );
          matchesDate = orderDate >= lastMonth;
        }
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((o) => o.isPaid)
      .reduce((acc, o) => acc + o.totalPrice, 0);
    const pendingRevenue = orders
      .filter((o) => !o.isPaid)
      .reduce((acc, o) => acc + o.totalPrice, 0);
    const activeOrders = orders.filter((o) => o.status !== "Delivered").length;
    const todayOrders = orders.filter(
      (o) =>
        new Date(o.createdAt).toDateString() === new Date().toDateString(),
    ).length;

    return {
      totalRevenue,
      pendingRevenue,
      activeOrders,
      todayOrders,
      totalOrders: orders.length,
    };
  }, [orders]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Enhanced Stats */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] block mb-2">
              Order Management
            </span>
            <h1 className="text-4xl font-serif font-black text-primary-dark">
              Orders Dashboard
            </h1>
            <p className="text-gray-400 font-medium mt-2">
              Manage and track all customer orders
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <IndianRupee className="text-primary" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Total Revenue
              </span>
            </div>
            <p className="text-3xl font-serif font-black text-primary-dark">
              ₹{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              From {orders.filter((o) => o.isPaid).length} paid orders
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 rounded-2xl border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="text-orange-600" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Pending Payment
              </span>
            </div>
            <p className="text-3xl font-serif font-black text-orange-600">
              ₹{stats.pendingRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              From {orders.filter((o) => !o.isPaid).length} unpaid orders
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="text-blue-600" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Active Orders
              </span>
            </div>
            <p className="text-3xl font-serif font-black text-blue-600">
              {stats.activeOrders}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Pending & in progress
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Today's Orders
              </span>
            </div>
            <p className="text-3xl font-serif font-black text-green-600">
              {stats.todayOrders}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              New orders today
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 sticky top-0 z-30 backdrop-blur-md bg-white/95">
        {/* Search */}
        <div className="relative flex-grow min-w-[250px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by order ID, name, phone..."
            className="w-full bg-[#ece0cc] border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-primary-dark focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-[#ece0cc] p-1.5 rounded-xl">
          {["All", ...ORDER_STAGES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === s
                  ? "bg-white text-primary-dark shadow-md"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Payment & Date Filters */}
        <div className="flex gap-2 bg-[#ece0cc] p-1.5 rounded-xl">
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="appearance-none bg-white border-none rounded-lg py-2 pl-3 pr-8 text-[10px] font-black uppercase tracking-widest text-primary-dark outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={12}
            />
          </div>

          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-white border-none rounded-lg py-2 pl-3 pr-8 text-[10px] font-black uppercase tracking-widest text-primary-dark outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
            >
              <option value="AllTime">All Time</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={12}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-8 py-4 rounded-full shadow-2xl border border-white/10 flex items-center gap-8"
          >
            <div className="flex items-center gap-3">
              <span className="bg-accent text-primary-dark px-3 py-1 rounded-full text-xs font-black">
                {selectedOrders.length}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Selected
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              {ORDER_STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleBulkStatusChange(s)}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              className="text-white/50 hover:text-white transition-colors"
              onClick={() => setSelectedOrders([])}
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#ece0cc] border-b border-gray-100">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-5 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                    checked={
                      selectedOrders.length > 0 &&
                      selectedOrders.length === filteredOrders.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-5">Order Details</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Items</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Payment Status</th>
                <th className="px-6 py-5">Order Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-8" colSpan={8}>
                        <div className="h-12 bg-gray-50 rounded-2xl w-full" />
                      </td>
                    </tr>
                  ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Package size={48} className="text-primary" />
                      <span className="text-sm font-black uppercase tracking-widest text-primary-dark">
                        No orders found
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr
                    key={order._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`group hover:bg-[#ece0cc]/30 transition-all ${
                      selectedOrders.includes(order._id) ? "bg-[#ece0cc]/50" : ""
                    }`}
                  >
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleSelectOrder(order._id)}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-primary-dark">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <Calendar size={10} />
                          <span className="font-bold">
                            {mounted
                              ? new Date(order.createdAt).toLocaleDateString(
                                  undefined,
                                  { day: "numeric", month: "short", year: "numeric" },
                                )
                              : "..."}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-700">
                          {order.shippingAddress.fullName}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone size={10} />
                          <span className="font-medium">
                            {order.shippingAddress.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center">
                          <FileText size={14} className="text-primary" />
                        </div>
                        <span className="text-sm font-bold text-gray-600">
                          {order.orderItems.length}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-lg font-black text-primary-dark">
                          ₹{order.totalPrice.toFixed(2)}
                        </span>
                        {order.couponCode && (
                          <span className="text-[9px] font-bold text-green-600 uppercase">
                            Coupon: {order.couponCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="relative max-w-[140px]">
                          <select
                            value={order.isPaid ? "Paid" : "Unpaid"}
                            onChange={(e) =>
                              handlePaymentStatusChange(
                                order._id,
                                e.target.value === "Paid",
                              )
                            }
                            className={`appearance-none w-full bg-[#ece0cc] border-none rounded-xl py-2.5 pl-3 pr-8 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white transition-all focus:ring-2 focus:ring-primary/20 ${
                              order.isPaid ? "text-green-600" : "text-orange-600"
                            }`}
                          >
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                          </select>
                          <ChevronDown
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            size={12}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400">
                          {order.paymentMethod === "COD" ? (
                            <Wallet size={10} />
                          ) : (
                            <CreditCard size={10} />
                          )}
                          <span className="font-bold uppercase">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative max-w-[140px]">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className={`appearance-none w-full bg-[#ece0cc] border-none rounded-xl py-2.5 pl-3 pr-8 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white transition-all focus:ring-2 focus:ring-primary/20 ${
                            order.status === "Delivered"
                              ? "text-green-600"
                              : order.status === "Shipping"
                                ? "text-orange-600"
                                : order.status === "Processing"
                                  ? "text-blue-600"
                                  : "text-gray-500"
                          }`}
                        >
                          {ORDER_STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          size={12}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          href={`/orders/${order._id}/invoice?format=a4`}
                          target="_blank"
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Print Invoice"
                        >
                          <Printer size={16} />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Sidebar */}
      <AnimatePresence>
        {viewingOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary-dark/80 backdrop-blur-sm z-[100]"
              onClick={() => setViewingOrder(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#ece0cc] shadow-2xl z-[101] overflow-y-auto"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-3">
                      Order Details
                    </span>
                    <h2 className="text-4xl font-serif font-black text-primary-dark">
                      #{viewingOrder._id.slice(-8).toUpperCase()}
                    </h2>
                    <p className="text-gray-400 font-medium text-sm mt-2">
                      {mounted
                        ? new Date(viewingOrder.createdAt).toLocaleString()
                        : "..."}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm hover:scale-110 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Status & Payment Info */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <PackageCheck className="text-primary" size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Order Status
                      </span>
                    </div>
                    <p
                      className={`text-2xl font-black ${
                        viewingOrder.status === "Delivered"
                          ? "text-green-600"
                          : viewingOrder.status === "Shipping"
                            ? "text-orange-600"
                            : viewingOrder.status === "Processing"
                              ? "text-blue-600"
                              : "text-gray-500"
                      }`}
                    >
                      {viewingOrder.status}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      {viewingOrder.paymentMethod === "COD" ? (
                        <Wallet className="text-primary" size={20} />
                      ) : (
                        <CreditCard className="text-primary" size={20} />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Payment
                      </span>
                    </div>
                    <p
                      className={`text-2xl font-black ${
                        viewingOrder.isPaid ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      {viewingOrder.isPaid ? "Paid" : "Unpaid"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium uppercase">
                      {viewingOrder.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                        <Mail size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                          Name
                        </p>
                        <p className="text-lg font-bold text-primary-dark">
                          {viewingOrder.shippingAddress.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                        <Phone size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                          Phone
                        </p>
                        <p className="text-lg font-bold text-primary-dark">
                          {viewingOrder.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                        <Mail size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                          Email
                        </p>
                        <p className="text-sm font-bold text-primary-dark">
                          {viewingOrder.shippingAddress.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                          Delivery Address
                        </p>
                        <p className="text-sm font-bold text-primary-dark leading-relaxed">
                          {viewingOrder.shippingAddress.address}
                          <br />
                          {viewingOrder.shippingAddress.city} -{" "}
                          {viewingOrder.shippingAddress.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
                  <div className="p-6 bg-[#ece0cc] border-b border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Order Items
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {viewingOrder.orderItems.map((item: any, i: number) => (
                      <div key={i} className="p-4 flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 relative">
                          <Image
                            src={item.image}
                            className="w-full h-full object-cover"
                            alt={item.name}
                            fill
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-black text-primary-dark">
                            {item.name}
                          </p>
                          {item.uom && (
                            <p className="text-xs text-gray-400 font-medium">
                              {item.uom}
                            </p>
                          )}
                          <p className="text-xs font-bold text-gray-500 mt-1">
                            ₹{item.price} × {item.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary-dark">
                            ₹{(item.price * item.qty).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-6 bg-[#ece0cc] space-y-3">
                    <div className="flex justify-between text-sm font-bold text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{viewingOrder.itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-600">
                      <span>Shipping</span>
                      <span>₹{viewingOrder.shippingPrice.toFixed(2)}</span>
                    </div>
                    {viewingOrder.taxPrice > 0 && (
                      <div className="flex justify-between text-sm font-bold text-gray-600">
                        <span>Tax</span>
                        <span>₹{viewingOrder.taxPrice.toFixed(2)}</span>
                      </div>
                    )}
                    {viewingOrder.discount > 0 && (
                      <div className="flex justify-between text-sm font-bold text-green-600">
                        <span>
                          Discount
                          {viewingOrder.couponCode && ` (${viewingOrder.couponCode})`}
                        </span>
                        <span>-₹{viewingOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-2xl font-black text-primary-dark pt-4 border-t-2 border-gray-200">
                      <span>Total</span>
                      <span>₹{viewingOrder.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Link
                    href={`/orders/${viewingOrder._id}/invoice?format=a4`}
                    target="_blank"
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl hover:bg-primary-dark transition-all"
                  >
                    <Printer size={16} /> Print Invoice
                  </Link>
                  <button className="flex-1 bg-white text-primary border-2 border-primary py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary/5 transition-all">
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
