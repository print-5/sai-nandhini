"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Ticket, Percent, Coins, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    expiryDate: "",
    description: "",
    isActive: true,
    displayInCheckout: true,
  });
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
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
    try {
      await fetch(`/api/admin/coupons/${deleteId}`, { method: "DELETE" });
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete coupon");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: Number(formData.value),
          minOrderAmount: Number(formData.minOrderAmount) || 0,
          maxDiscountAmount: formData.maxDiscountAmount
            ? Number(formData.maxDiscountAmount)
            : undefined,
          usageLimit: formData.usageLimit
            ? Number(formData.usageLimit)
            : undefined,
          expiryDate: formData.expiryDate
            ? new Date(formData.expiryDate)
            : undefined,
        }),
      });
      if (res.ok) {
        toast.success("Coupon created successfully");
        setIsModalOpen(false);
        setFormData({
          code: "",
          type: "percentage",
          value: "",
          minOrderAmount: "",
          maxDiscountAmount: "",
          usageLimit: "",
          expiryDate: "",
          description: "",
          isActive: true,
          displayInCheckout: true,
        });
        fetchCoupons();
      } else {
        toast.error("Failed to create coupon");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-2 block">
            Marketing Tools
          </span>
          <h1 className="text-4xl font-serif font-bold text-primary-dark">
            Promo <span className="text-primary italic">Codes</span>
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-primary-dark transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={20} />
          Create New Code
        </button>
      </header>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-6">
            <Ticket size={40} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-primary-dark mb-2">
            No Active Coupons
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Create discount codes to boost sales and reward customers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 group hover:border-primary/20 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setDeleteId(coupon._id)}
                  className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary/5 px-4 py-2 rounded-xl text-primary font-black uppercase tracking-widest text-sm border border-primary/10">
                  {coupon.code}
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-primary-dark">
                  {coupon.discountType === "percentage" ? (
                    <Percent size={18} />
                  ) : (
                    <Coins size={18} />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-serif font-bold text-primary-dark">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} OFF`}
                  </h3>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
                    {coupon.minOrderValue > 0
                      ? `Min. Order: ₹${coupon.minOrderValue}`
                      : "No Minimum Order"}
                  </p>
                  <div className="mt-2 space-y-0.5">
                    {coupon.validFrom && (
                      <p className="text-[10px] text-gray-400 font-medium">
                        Starts:{" "}
                        {new Date(coupon.validFrom).toLocaleDateString()}
                      </p>
                    )}
                    {coupon.expiresAt && (
                      <p className="text-[10px] text-gray-400 font-medium">
                        Ends: {new Date(coupon.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-gray-500">
                  <span>Used: {coupon.usedCount} times</span>
                  {coupon.usageLimit && <span>Limit: {coupon.usageLimit}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-serif font-bold text-primary-dark">
                  New Coupon
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-black text-lg uppercase tracking-wider text-primary-dark placeholder:text-gray-300"
                    placeholder="SUMMER2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Value
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Min. Order Value (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Limit Per User
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usageLimit: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Valid Until (Expiry)
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {creating && <Loader2 className="animate-spin" size={18} />}
                  Create Coupon
                </button>
              </form>
            </motion.div>
          </div>
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
