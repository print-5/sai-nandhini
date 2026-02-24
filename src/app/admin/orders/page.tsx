"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Truck,
  Clock,
  MoreVertical,
  Download,
  Printer,
  FileText,
  ChevronDown,
  X,
  Calendar,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

const ORDER_STAGES = ["Pending", "Processing", "Shipping", "Delivered"];

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [dateRange, setDateRange] = useState("AllTime");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

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

  useEffect(() => {
    fetchOrders();
  }, []);

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

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* Header & Stats Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#2F3E2C] tracking-tight">
            Order Intelligence
          </h1>
          <p className="text-gray-400 font-medium mt-1 tracking-wide">
            Real-time fulfillment and payment tracking.
          </p>
        </div>
        <div className="flex items-center gap-8 bg-[#F8F6F2] p-4 rounded-2xl">
          <div className="text-center">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Total Volume
            </div>
            <div className="text-2xl font-serif font-black text-[#2F3E2C]">
              ₹
              {orders
                .reduce((acc, o) => acc + o.totalPrice, 0)
                .toLocaleString()}
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div className="text-center">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Active Orders
            </div>
            <div className="text-2xl font-serif font-black text-[#C6A75E]">
              {orders.filter((o) => o.status !== "Delivered").length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 sticky top-0 z-30 backdrop-blur-md bg-white/90">
        {/* Search */}
        <div className="relative flex-grow min-w-[250px] group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C6A75E] transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full bg-[#F8F6F2] border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-[#2F3E2C] focus:ring-2 focus:ring-[#C6A75E]/30 transition-all placeholder:text-gray-400 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter (Primary - Buttons) */}
        <div className="flex items-center gap-1 bg-[#F8F6F2] p-1.5 rounded-xl overflow-x-auto no-scrollbar">
          {["All", "Pending", "Processing", "Delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === s ? "bg-white text-[#2F3E2C] shadow-md" : "text-gray-400 hover:text-gray-600"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-gray-100 hidden lg:block" />

        {/* Secondary Filters (Dropdowns) */}
        <div className="flex gap-2 bg-[#F8F6F2] p-1.5 rounded-xl">
          {/* Payment Filter */}
          <div className="relative group">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="appearance-none bg-white border-none rounded-lg py-2 pl-3 pr-8 text-[10px] font-black uppercase tracking-widest text-[#2F3E2C] outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
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

          {/* Date Filter */}
          <div className="relative group">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-white border-none rounded-lg py-2 pl-3 pr-8 text-[10px] font-black uppercase tracking-widest text-[#2F3E2C] outline-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
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

      {/* Bulk Actions (Conditional) */}
      <AnimatePresence>
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#2F3E2C] text-white px-8 py-4 rounded-full shadow-2xl border border-white/10 flex items-center gap-8"
          >
            <div className="flex items-center gap-3">
              <span className="bg-[#C6A75E] text-[#2F3E2C] px-3 py-1 rounded-full text-xs font-black">
                {selectedOrders.length}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Orders Selected
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/50 mr-2">
                Mark As:
              </span>
              {ORDER_STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleBulkStatusChange(s)}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/20 hover:scale-105 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-white/10" />
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
        <table className="w-full text-left">
          <thead className="bg-[#F8F6F2] border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-6 w-12 text-center border-r border-gray-200/50">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#2F3E2C] focus:ring-[#2F3E2C] cursor-pointer w-4 h-4 accent-[#2F3E2C]"
                  checked={
                    selectedOrders.length > 0 &&
                    selectedOrders.length === filteredOrders.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-8 py-6">Order ID & Identity</th>
              <th className="px-8 py-6">Composition</th>
              <th className="px-8 py-6">Financials</th>
              <th className="px-8 py-6">Fulfillment Meta</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-10" colSpan={6}>
                      <div className="h-12 bg-gray-50 rounded-2xl w-full" />
                    </td>
                  </tr>
                ))
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <Package size={48} className="text-[#2F3E2C]" />
                    <span className="text-sm font-black uppercase tracking-widest text-[#2F3E2C]">
                      No matching orders found
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
                  className={`group hover:bg-[#F8F6F2]/50 transition-all ${selectedOrders.includes(order._id) ? "bg-[#F8F6F2]" : ""}`}
                >
                  <td className="px-8 py-6 text-center border-r border-gray-50">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#2F3E2C] focus:ring-[#2F3E2C] cursor-pointer w-4 h-4 accent-[#2F3E2C]"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleSelectOrder(order._id)}
                    />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#2F3E2C] tracking-tight">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-gray-500 mt-1">
                        {order.shippingAddress.fullName}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar size={10} className="text-gray-300" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase">
                          {new Date(order.createdAt).toLocaleDateString(
                            undefined,
                            { day: "numeric", month: "short" },
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#2F3E2C]/5 rounded-lg flex items-center justify-center text-[#2F3E2C]">
                        <FileText size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">
                        {order.orderItems.length} Products
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-lg font-black text-[#2F3E2C] tracking-tighter">
                        ₹{order.totalPrice.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {order.isPaid ? (
                          <CheckCircle size={10} className="text-green-500" />
                        ) : (
                          <AlertCircle size={10} className="text-orange-500" />
                        )}
                        <span
                          className={`text-[9px] font-black uppercase tracking-[0.1em] ${order.isPaid ? "text-green-500" : "text-orange-500"}`}
                        >
                          {order.isPaid ? "Settled" : "Unpaid"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="relative group/select max-w-[150px]">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={`appearance-none w-full bg-[#F8F6F2] border-none rounded-xl py-3 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white transition-all focus:ring-2 focus:ring-[#C6A75E]/30 ${
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        size={14}
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="p-3 text-gray-300 hover:text-[#2F3E2C] hover:bg-[#2F3E2C]/5 rounded-xl transition-all"
                        title="Visual Audit"
                      >
                        <Eye size={18} />
                      </button>
                      <Link
                        href={`/orders/${order._id}/invoice?format=a4`}
                        target="_blank"
                        className="p-3 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        title="Print Master Invoice"
                      >
                        <Printer size={18} />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Sidebar Overlay */}
      <AnimatePresence>
        {viewingOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#2F3E2C]/80 backdrop-blur-sm z-[100]"
              onClick={() => setViewingOrder(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#FAF9F6] shadow-2xl z-[101] overflow-y-auto p-12"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-1">
                  <div className="bg-[#2F3E2C]/10 text-[#2F3E2C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                    Order Intelligence
                  </div>
                  <h2 className="text-4xl font-serif font-black text-[#2F3E2C]">
                    #{viewingOrder._id.slice(-8).toUpperCase()}
                  </h2>
                  <p className="text-gray-400 font-medium text-xs uppercase tracking-widest mt-2">
                    {new Date(viewingOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm hover:scale-110 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-12">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Shipping Matrix
                    </h4>
                    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-2">
                      <p className="font-bold text-[#2F3E2C] text-lg">
                        {viewingOrder.shippingAddress.fullName}
                      </p>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {viewingOrder.shippingAddress.address}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {viewingOrder.shippingAddress.city} -{" "}
                        {viewingOrder.shippingAddress.pincode}
                      </p>
                      <p className="text-[#C6A75E] font-bold text-sm pt-2">
                        {viewingOrder.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Live Log
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-100">
                          <CheckCircle2 size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2F3E2C]">
                            Order Received
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {new Date(
                              viewingOrder.createdAt,
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {viewingOrder.isPaid && (
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0 border border-green-100">
                            <CheckCircle2 size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#2F3E2C]">
                              Funds Captured
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">
                              {new Date(
                                viewingOrder.paidAt || viewingOrder.createdAt,
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Manifest
                  </h4>
                  <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-50">
                      {viewingOrder.orderItems.map((item: any, i: number) => (
                        <div key={i} className="p-4 flex gap-4 items-center">
                          <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                            <img
                              src={item.image}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div className="flex-grow">
                            <p className="text-[10px] font-black uppercase text-gray-400 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs font-bold text-[#2F3E2C]">
                              ₹{item.price} × {item.qty}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-[#F8F6F2] space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                        <span>Subtotal</span>
                        <span>₹{viewingOrder.itemsPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                        <span>Shipping</span>
                        <span>₹{viewingOrder.shippingPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-[#2F3E2C] pt-4 border-t border-gray-200">
                        <span>Total</span>
                        <span>₹{viewingOrder.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href={`/orders/${viewingOrder._id}/invoice?format=a4`}
                  target="_blank"
                  className="flex-grow bg-[#2F3E2C] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl hover:bg-[#1f2b1d] transition-all"
                >
                  <Printer size={16} /> Print Master Invoice
                </Link>
                <button className="flex-grow bg-white text-[#2F3E2C] border border-gray-200 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                  <Download size={16} /> Export Data
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading Intelligence...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
