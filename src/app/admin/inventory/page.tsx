"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Plus,
  Minus,
  History,
  Package,
  Save,
  X,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [threshold, setThreshold] = useState(10);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [actionType, setActionType] = useState<
    "purchase" | "adjustment" | null
  >(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Form State
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [cost, setCost] = useState<number | "">("");
  const [supplier, setSupplier] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const [prodRes, settingsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/admin/settings"),
      ]);
      const productsData = await prodRes.json();
      const settingsData = await settingsRes.json();

      setProducts(productsData);
      setThreshold(settingsData.lowStockThreshold || 10);
    } catch (err) {
      console.error("Failed to fetch inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchHistory = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/inventory?productId=${productId}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleManageStock = (product: any) => {
    setSelectedProduct(product);
    fetchHistory(product._id);
    setActionType(null);
    setQuantity("");
    setReason("");
    setCost("");
    setSupplier("");
  };

  const handleSubmit = async () => {
    if (!quantity || isNaN(Number(quantity))) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        productId: selectedProduct._id,
        variantSku: selectedVariant?.uom || null,
        type: actionType === "purchase" ? "Purchase" : "Adjustment",
        quantity: Number(quantity),
        reason: actionType === "adjustment" ? reason : undefined,
        costPerUnit: actionType === "purchase" ? Number(cost) : undefined,
        supplier: actionType === "purchase" ? supplier : undefined,
      };

      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const productRes = await fetch(`/api/products/${selectedProduct._id}`);
        const updatedProduct = await productRes.json();
        setSelectedProduct(updatedProduct);
        fetchProducts();
        fetchHistory(selectedProduct._id);
        setActionType(null);
        setQuantity("");
        setReason("");
        setCost("");
        setSupplier("");
        toast.success("Inventory updated successfully");
      } else {
        toast.error("Failed to update stock");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-4 border-b border-[#2F3E2C]/5">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#2F3E2C] tracking-tight">
            Stock Control
          </h1>
          <p className="text-gray-400 mt-2 font-medium tracking-wide">
            Monitor stock levels, reconcile inventory, and track movement.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-gray-100 text-[#2F3E2C] px-6 py-4 rounded-xl flex items-center gap-3 font-bold uppercase tracking-wider text-xs shadow-sm hover:shadow-md transition-all">
            <ClipboardList size={18} /> Reports
          </button>
        </div>
      </div>

      {/* Search Top Bar */}
      <div className="sticky top-0 z-30 py-4 bg-[#F8F6F2]/80 backdrop-blur-md">
        <div className="relative w-full shadow-sm rounded-2xl group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#C6A75E] transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by product name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 focus:border-[#C6A75E]/50 rounded-2xl py-4 pl-14 pr-6 outline-none transition-all font-medium text-[#2F3E2C] placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#C6A75E] border-t-transparent rounded-full animate-spin mb-6" />
            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">
              Syncing Inventory...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-100">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-[#2F3E2C] mb-2">
              No Items Found
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredProducts.map((p, i) => {
              const totalStock =
                p.variants?.reduce(
                  (acc: number, v: any) => acc + (v.stock || 0),
                  0,
                ) ||
                p.stock ||
                0;
              const isLowStock = totalStock <= threshold && totalStock > 0;
              const isOutOfStock = totalStock === 0;

              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleManageStock(p)}
                  className="group bg-white rounded-[20px] p-5 border border-gray-100 hover:border-[#C6A75E]/30 hover:shadow-lg hover:shadow-[#C6A75E]/5 transition-all duration-300 cursor-pointer flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
                >
                  <div className="w-full md:w-16 h-16 bg-[#F8F6F2] rounded-2xl overflow-hidden shrink-0 relative">
                    {p.images?.[0] ? (
                      <Image
                        src={p.images[0]}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        alt={p.name}
                        fill
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300">
                        <Package size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-grow text-center md:text-left">
                    <h3 className="font-bold text-[#2F3E2C] text-lg leading-tight group-hover:text-[#C6A75E] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                      {p.category} •{" "}
                      {p.variants?.length
                        ? `${p.variants.length} Variants`
                        : "Single SKU"}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end px-4 md:px-0 border-t md:border-none border-gray-50 pt-4 md:pt-0">
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                        Stock Level
                      </p>
                      <div
                        className={`flex items-center justify-center md:justify-end gap-2 ${isOutOfStock ? "text-red-500" : isLowStock ? "text-orange-500" : "text-green-600"}`}
                      >
                        {isLowStock && <AlertCircle size={14} />}
                        <span className="font-bold text-xl font-serif">
                          {totalStock}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                          {p.uom || "Units"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FAF3E0] p-3 rounded-full text-[#C6A75E] opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                      <History size={20} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Management Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-[#2F3E2C]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative z-10"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#F8F6F2]">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-[#2F3E2C]">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Package size={14} /> Stock Management & History
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white">
                {/* Left Col: Stock Actions */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2F3E2C] mb-4">
                      Current Stock Levels
                    </h3>
                    <div className="space-y-3">
                      {selectedProduct.variants &&
                      selectedProduct.variants.length > 0 ? (
                        selectedProduct.variants.map((v: any, i: number) => (
                          <div
                            key={i}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer group ${selectedVariant?.uom === v.uom ? "border-[#C6A75E] bg-[#C6A75E]/5 ring-1 ring-[#C6A75E]/20" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}
                            onClick={() => {
                              setSelectedVariant(v);
                              setActionType(null);
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#2F3E2C] font-bold text-xs shadow-sm border border-gray-100">
                                  {v.uom.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-[#2F3E2C]">
                                    {v.uom}
                                  </p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    SKU: {v.sku || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`text-2xl font-serif font-black ${v.stock <= threshold ? "text-red-500" : "text-[#2F3E2C]"}`}
                                >
                                  {v.stock || 0}
                                </span>
                                <span className="text-[10px] block font-bold text-gray-400 uppercase tracking-wider">
                                  Units
                                </span>
                              </div>
                            </div>

                            {selectedVariant?.uom === v.uom && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="pt-4 mt-4 border-t border-[#C6A75E]/10 flex gap-3"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionType("purchase");
                                  }}
                                  className="flex-1 py-3 bg-[#2F3E2C] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1f2b1d] transition-colors flex justify-center items-center gap-2 shadow-lg shadow-[#2F3E2C]/20"
                                >
                                  <ArrowDownRight size={14} /> Receive Stock
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActionType("adjustment");
                                  }}
                                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex justify-center items-center gap-2"
                                >
                                  <History size={14} /> Adjust / Count
                                </button>
                              </motion.div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 text-center">
                          <p className="text-gray-400 font-bold mb-4">
                            Single SKU Product
                          </p>
                          <div className="flex gap-4 justify-center">
                            <button
                              onClick={() => {
                                setSelectedVariant(null);
                                setActionType("purchase");
                              }}
                              className="px-6 py-3 bg-[#2F3E2C] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg"
                            >
                              Manage Stock
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Form */}
                  <AnimatePresence>
                    {actionType && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-[#FAF3E0] p-6 rounded-[24px] border border-[#C6A75E]/20 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          {actionType === "purchase" ? (
                            <ArrowDownRight
                              size={80}
                              className="text-[#2F3E2C]"
                            />
                          ) : (
                            <History size={80} className="text-[#C6A75E]" />
                          )}
                        </div>
                        <h4 className="font-bold text-[#2F3E2C] mb-6 flex items-center gap-2 relative z-10">
                          {actionType === "purchase"
                            ? "Record Incoming Stock"
                            : "Inventory Adjustment"}
                        </h4>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                          <div className="col-span-2">
                            <label className="text-[10px] font-bold text-[#2F3E2C]/60 uppercase tracking-widest mb-1.5 block">
                              Quantity Change
                            </label>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) =>
                                setQuantity(Number(e.target.value))
                              }
                              placeholder="0"
                              className="w-full bg-white p-4 rounded-xl shadow-sm text-lg font-bold text-[#2F3E2C] outline-none focus:ring-2 focus:ring-[#C6A75E]/50 transition-all font-serif"
                            />
                          </div>

                          {actionType === "purchase" ? (
                            <>
                              <div>
                                <label className="text-[10px] font-bold text-[#2F3E2C]/60 uppercase tracking-widest mb-1.5 block">
                                  Unit Cost (₹)
                                </label>
                                <input
                                  type="number"
                                  value={cost}
                                  onChange={(e) =>
                                    setCost(Number(e.target.value))
                                  }
                                  placeholder="0.00"
                                  className="w-full bg-white p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#C6A75E]/50 font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-[#2F3E2C]/60 uppercase tracking-widest mb-1.5 block">
                                  Supplier
                                </label>
                                <input
                                  type="text"
                                  value={supplier}
                                  onChange={(e) => setSupplier(e.target.value)}
                                  placeholder="Vendor Name"
                                  className="w-full bg-white p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#C6A75E]/50 font-medium"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="col-span-2">
                              <label className="text-[10px] font-bold text-[#2F3E2C]/60 uppercase tracking-widest mb-1.5 block">
                                Reason Code
                              </label>
                              <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-white p-3 rounded-xl outline-none font-medium cursor-pointer"
                              >
                                <option value="">Select Reason...</option>
                                <option value="Damaged">
                                  Damaged / Spoilage
                                </option>
                                <option value="Theft">Shrinkage / Theft</option>
                                <option value="Audit">Audit Correction</option>
                                <option value="Return">Customer Return</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-6 relative z-10">
                          <button
                            onClick={() => setActionType(null)}
                            className="flex-1 py-3 text-gray-500 font-bold hover:bg-black/5 rounded-xl transition-colors uppercase tracking-widest text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={formLoading}
                            className="flex-[2] py-3 bg-[#2F3E2C] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-[#1f2b1d] transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2"
                          >
                            {formLoading ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Save size={16} />
                            )}
                            Confirm Update
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Col: History */}
                <div className="bg-[#F8F6F2] rounded-[2rem] p-8 flex flex-col h-[600px] border border-[#2F3E2C]/5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#2F3E2C]">
                      Transaction Log
                    </h3>
                    <div className="p-2 bg-white rounded-lg text-[#C6A75E] shadow-sm">
                      <History size={16} />
                    </div>
                  </div>

                  <div className="overflow-y-auto space-y-4 flex-grow pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <ClipboardList
                          size={40}
                          className="mb-2 text-[#2F3E2C]"
                        />
                        <p className="text-xs font-bold uppercase tracking-widest">
                          No transactions yet
                        </p>
                      </div>
                    ) : (
                      history.map((tx, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group hover:border-[#C6A75E]/30 transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "Purchase" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}
                              >
                                {tx.type === "Purchase" ? (
                                  <ArrowDownRight size={14} />
                                ) : (
                                  <ArrowUpRight size={14} />
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-black text-[#2F3E2C] uppercase tracking-wide">
                                  {tx.type}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400">
                                  {new Date(tx.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-lg font-serif font-black ${tx.quantity > 0 ? "text-green-600" : "text-red-500"}`}
                            >
                              {tx.quantity > 0 ? "+" : ""}
                              {tx.quantity}
                            </span>
                          </div>

                          {tx.reason && (
                            <div className="mt-2 text-[10px] bg-gray-50 p-2 rounded-lg font-medium text-gray-500 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />{" "}
                              {tx.reason}
                            </div>
                          )}
                          {tx.supplier && (
                            <div className="mt-2 text-[10px] bg-gray-50 p-2 rounded-lg font-medium text-gray-500 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#C6A75E] rounded-full" />{" "}
                              {tx.supplier}
                            </div>
                          )}

                          <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                            <span>Prev: {tx.previousStock}</span>
                            <span>New: {tx.newStock}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
