"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Copy,
  Share2,
  Pencil,
  Trash2,
  Percent,
  IndianRupee,
  Truck,
  Activity,
  Calendar,
  Ticket,
  Loader2,
  Settings2,
  ShoppingCart,
  X,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

export default function CouponsClient({ initialData }: { initialData: any[] }) {
  const [coupons, setCoupons] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [currentCoupon, setCurrentCoupon] = useState<{
    _id?: string;
    code: string;
    discountType: "percentage" | "fixed" | "free-delivery";
    discountValue: number;
    minOrderValue: number;
    isActive: boolean;
    displayInCheckout: boolean;
    description: string;
    maxDiscountAmount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    expiresAt?: string;
  }>({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    isActive: true,
    displayInCheckout: true,
    description: "",
    maxDiscountAmount: 0,
    usageLimit: undefined,
    perUserLimit: undefined,
  });

  const [bulkData, setBulkData] = useState({
    count: 5,
    prefix: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 500,
    isActive: true,
    displayInCheckout: true,
    usageLimit: 1,
    perUserLimit: 1,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } else {
        toast.error("Failed to delete coupon");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete coupon");
    } finally {
      setIsActionLoading(false);
      setDeleteId(null);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const url = currentCoupon._id
        ? `/api/admin/coupons/${currentCoupon._id}`
        : "/api/admin/coupons";
      const method = currentCoupon._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: currentCoupon.code.toUpperCase(),
          discountType: currentCoupon.discountType,
          discountValue: currentCoupon.discountValue,
          minOrderValue: currentCoupon.minOrderValue,
          maxDiscountAmount: currentCoupon.maxDiscountAmount || undefined,
          usageLimit: currentCoupon.usageLimit || undefined,
          perUserLimit: currentCoupon.perUserLimit || undefined,
          expiresAt: currentCoupon.expiresAt
            ? new Date(currentCoupon.expiresAt)
            : undefined,
          isActive: currentCoupon.isActive,
          displayInCheckout: currentCoupon.displayInCheckout,
          description: currentCoupon.description,
        }),
      });

      if (res.ok) {
        toast.success(
          `Coupon ${currentCoupon._id ? "updated" : "created"} successfully`,
        );
        setIsDialogOpen(false);
        fetchCoupons();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save coupon");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save coupon");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);

    // Generate array of coupons to send
    const newCoupons = Array.from({ length: bulkData.count }).map(() => ({
      code: `${bulkData.prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      discountType: bulkData.discountType,
      discountValue: bulkData.discountValue,
      minOrderValue: bulkData.minOrderValue,
      isActive: bulkData.isActive,
      displayInCheckout: bulkData.displayInCheckout,
      usageLimit: bulkData.usageLimit,
      perUserLimit: bulkData.perUserLimit,
      description: `Bulk generated coupon`,
    }));

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupons),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Generated ${data.count} coupons successfully`);
        setIsBulkDialogOpen(false);
        fetchCoupons();
      } else {
        toast.error(data.error || "Failed to bulk generate");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate coupons");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleShare = async (code: string) => {
    const text = `Use code ${code} for a discount on your next order!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Discount Code",
          text,
          url: window.location.origin,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const openAddDialog = () => {
    setCurrentCoupon({
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      isActive: true,
      displayInCheckout: true,
      description: "",
      maxDiscountAmount: 0,
      usageLimit: undefined,
      perUserLimit: undefined,
      expiresAt: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (coupon: any) => {
    setCurrentCoupon({
      _id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || 0,
      minOrderValue: coupon.minOrderValue || 0,
      isActive: coupon.isActive,
      displayInCheckout: coupon.displayInCheckout !== false,
      description: coupon.description || "",
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-gray-400 font-medium">Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-white border border-gray-100 p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] block">
              Marketing Tools
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-primary-dark">
              Coupon Management
            </h1>
            <p className="text-gray-400 text-sm max-w-xl font-medium">
              Create and manage promotional discount codes to drive sales and
              reward customer loyalty.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsBulkDialogOpen(true)}
              className="px-6 py-3 rounded-2xl font-bold border border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-sm"
            >
              <Copy size={16} />
              Bulk Generate
            </button>
            <button
              onClick={openAddDialog}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-primary-dark transition-all flex items-center gap-2 active:scale-95 text-sm"
            >
              <Plus size={16} />
              Create Coupon
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
            <Ticket size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Total Coupons
            </p>
            <h3 className="text-2xl font-serif font-black text-primary-dark">
              {coupons.length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Active Now
            </p>
            <h3 className="text-2xl font-serif font-black text-primary-dark">
              {coupons.filter((c) => c.isActive).length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Total Redemptions
            </p>
            <h3 className="text-2xl font-serif font-black text-primary-dark">
              {coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
            </h3>
          </div>
        </div>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-6">
            <Ticket size={40} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-primary-dark mb-2">
            No Active Coupons
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm">
            Create discount codes to boost sales and reward customers.
          </p>
          <button
            onClick={openAddDialog}
            className="border-2 border-primary/20 text-primary px-8 py-3 rounded-2xl font-bold hover:bg-primary/5 transition-all"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {coupons.map((coupon) => (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] shadow-sm border border-gray-100 group hover:border-primary/20 transition-all flex flex-col overflow-hidden"
              >
                <div className="p-6 border-b border-gray-50 flex justify-between items-start bg-gray-50/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-lg">
                        {coupon.code}
                      </span>
                      {!coupon.isActive && (
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium line-clamp-1 mt-2">
                      {coupon.description || "No description provided"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleShare(coupon.code)}
                      className="w-8 h-8 rounded-lg text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                      title="Share Coupon"
                    >
                      <Share2 size={14} />
                    </button>
                    <button
                      onClick={() => openEditDialog(coupon)}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 flex items-center justify-center transition-colors"
                      title="Edit Coupon"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(coupon._id)}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5 flex-1 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Discount
                      </p>
                      <div className="flex items-center gap-1.5 font-bold text-xl text-primary-dark">
                        {coupon.discountType === "percentage" ? (
                          <>
                            {coupon.discountValue}
                            <Percent size={16} className="text-primary" />
                          </>
                        ) : coupon.discountType === "fixed" ? (
                          <>
                            <IndianRupee size={16} className="text-[#f8bf51]" />
                            {coupon.discountValue}
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-primary">
                            <Truck size={16} />
                            <span className="text-sm">Free Delivery</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Min. Order
                      </p>
                      <div className="flex items-center gap-1.5 font-bold text-xl text-gray-700">
                        <IndianRupee size={16} className="text-gray-300" />
                        {coupon.minOrderValue || 0}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Activity size={14} className="text-gray-300" />
                        Total Used: {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
                      </div>
                      {coupon.expiresAt && (
                        <div className="flex items-center gap-1.5 text-orange-500/80">
                          <Calendar size={14} />
                          {mounted
                            ? new Date(coupon.expiresAt).toLocaleDateString(
                                undefined,
                                { day: "numeric", month: "short" },
                              )
                            : "..."}
                        </div>
                      )}
                    </div>
                    {coupon.perUserLimit && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Per User:
                        </span>
                        <span className="text-gray-600">
                          {coupon.perUserLimit} use{coupon.perUserLimit > 1 ? 's' : ''} max
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Shared backdrop for both modals */}
      <AnimatePresence>
        {(isDialogOpen || isBulkDialogOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            {/* Create/Edit Modal */}
            {isDialogOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#ece0cc]">
                  <div>
                    <h2 className="text-2xl font-serif font-black text-primary-dark">
                      {currentCoupon._id ? "Edit Coupon" : "Create New Coupon"}
                    </h2>
                    <p className="text-xs font-medium text-gray-400 mt-1">
                      Configure your discount code settings below.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="overflow-y-auto px-8 py-6 flex-1 custom-scrollbar">
                  <form
                    id="coupon-form"
                    onSubmit={handleSaveCoupon}
                    className="space-y-6 pb-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Coupon Code
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={currentCoupon.code}
                          onChange={(e) =>
                            setCurrentCoupon({
                              ...currentCoupon,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-black text-lg uppercase tracking-wider text-primary-dark placeholder:text-gray-300"
                          placeholder="SUMMER2026"
                        />
                        <Ticket
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"
                          size={20}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Discount Type
                        </label>
                        <select
                          value={currentCoupon.discountType}
                          onChange={(e: any) =>
                            setCurrentCoupon({
                              ...currentCoupon,
                              discountType: e.target.value,
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                          <option value="free-delivery">Free Delivery</option>
                        </select>
                      </div>

                      {currentCoupon.discountType !== "free-delivery" && (
                        <div className="space-y-2 animate-in fade-in">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                            Discount Value
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              {currentCoupon.discountType === "percentage" ? (
                                <Percent size={18} />
                              ) : (
                                <IndianRupee size={18} />
                              )}
                            </span>
                            <input
                              type="number"
                              required
                              value={currentCoupon.discountValue || ""}
                              onChange={(e) =>
                                setCurrentCoupon({
                                  ...currentCoupon,
                                  discountValue: Number(e.target.value),
                                })
                              }
                              className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-gray-700"
                              placeholder="20"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Min. Order Value
                      </label>
                      <div className="relative">
                        <IndianRupee
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="number"
                          value={currentCoupon.minOrderValue || ""}
                          onChange={(e) =>
                            setCurrentCoupon({
                              ...currentCoupon,
                              minOrderValue: Number(e.target.value),
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-gray-700"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Usage Limit
                        </label>
                        <input
                          type="number"
                          value={currentCoupon.usageLimit || ""}
                          onChange={(e) =>
                            setCurrentCoupon({
                              ...currentCoupon,
                              usageLimit: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-700"
                          placeholder="∞"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Per User Limit
                        </label>
                        <input
                          type="number"
                          value={currentCoupon.perUserLimit || ""}
                          onChange={(e) =>
                            setCurrentCoupon({
                              ...currentCoupon,
                              perUserLimit: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-700"
                          placeholder="∞"
                        />
                      </div>
                    </div>

                    {currentCoupon.discountType === "percentage" && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Max Discount Amount (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                          />
                          <input
                            type="number"
                            value={currentCoupon.maxDiscountAmount || ""}
                            onChange={(e) =>
                              setCurrentCoupon({
                                ...currentCoupon,
                                maxDiscountAmount: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-gray-700"
                            placeholder="No limit"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={currentCoupon.expiresAt}
                        onChange={(e) =>
                          setCurrentCoupon({
                            ...currentCoupon,
                            expiresAt: e.target.value,
                          })
                        }
                        className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={currentCoupon.description}
                        onChange={(e) =>
                          setCurrentCoupon({
                            ...currentCoupon,
                            description: e.target.value,
                          })
                        }
                        className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-700"
                        placeholder="E.g. Diwali Special"
                      />
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-3 bg-[#ece0cc] py-4 px-6 rounded-2xl cursor-pointer flex-1 border border-transparent hover:border-primary/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={currentCoupon.isActive}
                          onChange={(e) =>
                            setCurrentCoupon({
                              ...currentCoupon,
                              isActive: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-primary rounded cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-700">
                          Active Status
                        </span>
                      </label>

                      <label className="flex items-center gap-3 bg-[#ece0cc] py-4 px-6 rounded-2xl cursor-pointer flex-1 border border-transparent hover:border-primary/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={currentCoupon.displayInCheckout}
                          onChange={(e) =>
                            setCurrentCoupon({
                              ...currentCoupon,
                              displayInCheckout: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-primary rounded cursor-pointer"
                        />
                        <span className="text-sm font-bold text-gray-700">
                          Show in Checkout
                        </span>
                      </label>
                    </div>
                  </form>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="coupon-form"
                    disabled={isActionLoading}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isActionLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {currentCoupon._id ? "Update Coupon" : "Create Coupon"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Bulk Generate Modal */}
            {isBulkDialogOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden relative"
              >
                <div className="p-8 border-b border-gray-100 bg-[#ece0cc] flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-black text-primary-dark flex items-center gap-2">
                      <Settings2 size={24} className="text-primary" /> Bulk
                      Create
                    </h2>
                    <p className="text-xs font-medium text-gray-400 mt-1">
                      Generate multiple unique codes at once.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBulkDialogOpen(false)}
                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <form
                    id="bulk-form"
                    onSubmit={handleBulkGenerate}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Coupon Count
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          required
                          value={bulkData.count}
                          onChange={(e) =>
                            setBulkData({
                              ...bulkData,
                              count: Number(e.target.value),
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Code Prefix
                        </label>
                        <input
                          type="text"
                          value={bulkData.prefix}
                          onChange={(e) =>
                            setBulkData({
                              ...bulkData,
                              prefix: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-black uppercase text-primary-dark"
                          placeholder="E.g. NEW"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Discount Type
                      </label>
                      <select
                        value={bulkData.discountType}
                        onChange={(e: any) =>
                          setBulkData({
                            ...bulkData,
                            discountType: e.target.value,
                          })
                        }
                        className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium text-gray-700 appearance-none cursor-pointer"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                        <option value="free-delivery">Free Delivery</option>
                      </select>
                    </div>

                    {bulkData.discountType !== "free-delivery" && (
                      <div className="space-y-2 animate-in fade-in">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Discount Value
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {bulkData.discountType === "percentage" ? (
                              <Percent size={18} />
                            ) : (
                              <IndianRupee size={18} />
                            )}
                          </span>
                          <input
                            type="number"
                            required
                            value={bulkData.discountValue || ""}
                            onChange={(e) =>
                              setBulkData({
                                ...bulkData,
                                discountValue: Number(e.target.value),
                              })
                            }
                            className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 pl-12 pr-6 outline-none transition-all font-bold text-gray-700"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Min. Order (₹)
                      </label>
                      <input
                        type="number"
                        value={bulkData.minOrderValue}
                        onChange={(e) =>
                          setBulkData({
                            ...bulkData,
                            minOrderValue: Number(e.target.value),
                          })
                        }
                        className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Usage Limit
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={bulkData.usageLimit}
                          onChange={(e) =>
                            setBulkData({
                              ...bulkData,
                              usageLimit: Number(e.target.value),
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Per User Limit
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={bulkData.perUserLimit}
                          onChange={(e) =>
                            setBulkData({
                              ...bulkData,
                              perUserLimit: Number(e.target.value),
                            })
                          }
                          className="w-full bg-[#ece0cc] border-none focus:ring-2 focus:ring-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-bold text-gray-700"
                        />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4">
                  <button
                    onClick={() => setIsBulkDialogOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="bulk-form"
                    disabled={isActionLoading}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isActionLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                    Generate
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
