"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  MoreVertical,
  Package,
  ExternalLink,
  Activity,
  AlertTriangle,
  Layers,
  DollarSign,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductModal from "@/components/admin/ProductModal";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

export default function ProductsClient({
  initialProducts,
  initialSettings,
}: {
  initialProducts: any[];
  initialSettings: any;
}) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [threshold] = useState(initialSettings.lowStockThreshold || 10);
  const [manageInventory] = useState(initialSettings.manageInventory ?? true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>("all");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?admin=true");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Received invalid data format:", data);
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error("Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    const url = editingProduct
      ? `/api/products/${editingProduct._id}`
      : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        toast.success(editingProduct ? "Product updated!" : "Product created!");
        fetchProducts();
        setIsModalOpen(false); // Close modal on successful save
      } else {
        toast.error("Failed to save product");
      }
    } catch (err) {
      console.error("Failed to save product", err);
      toast.error("An error occurred while saving");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      console.error("Failed to delete product", err);
      toast.error("An error occurred while deleting");
    } finally {
      setDeleteId(null); // Close confirmation modal
    }
  };

  const filteredProducts = products.filter((p) => {
    // Search filter
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    // Stock status filter
    let matchesStock = true;
    if (selectedStockStatus !== "all" && manageInventory) {
      const stock =
        p.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) ||
        p.stock ||
        0;

      if (selectedStockStatus === "in-stock") {
        matchesStock = stock > threshold;
      } else if (selectedStockStatus === "low-stock") {
        matchesStock = stock > 0 && stock <= threshold;
      } else if (selectedStockStatus === "out-of-stock") {
        matchesStock = stock === 0;
      }
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // KPI Calculations
  const totalProducts = products.length;
  const allCategories = Array.from(new Set(products.map((p) => p.category)));
  const totalCategories = allCategories.length;
  const lowStockCount = manageInventory
    ? products.filter((p) => {
        const stock =
          p.variants?.reduce(
            (acc: number, v: any) => acc + (v.stock || 0),
            0,
          ) ||
          p.stock ||
          0;
        return stock <= threshold && stock > 0;
      }).length
    : 0;

  // Derived logic for display
  const getStockStatus = (p: any) => {
    if (!manageInventory) {
      return {
        label: "Inventory Off",
        color: "bg-gray-400",
        text: "text-gray-500",
        bg: "bg-gray-50",
        value: "N/A",
      };
    }

    const stock =
      p.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) ||
      p.stock ||
      0;
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-500",
        text: "text-red-500",
        bg: "bg-red-50",
        value: 0,
      };
    if (stock <= threshold)
      return {
        label: "Low Stock",
        color: "bg-orange-500",
        text: "text-orange-600",
        bg: "bg-orange-50",
        value: stock,
      };
    return {
      label: "In Stock",
      color: "bg-green-600",
      text: "text-green-700",
      bg: "bg-green-50",
      value: stock,
    };
  };

  return (
    <div className="space-y-8 font-sans">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Products",
            value: totalProducts,
            icon: Package,
            color: "text-[#234d1b]",
          },
          {
            label: "Total Categories",
            value: totalCategories,
            icon: Layers,
            color: "text-[#f8bf51]",
          },
          {
            label: "Low Stock Items",
            value: lowStockCount,
            icon: AlertTriangle,
            color: "text-orange-500",
          },
          {
            label: "Monthly Revenue",
            value: "₹45.2k",
            icon: Activity,
            color: "text-green-600",
          }, // Mocked
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow duration-300"
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-1">
                {kpi.label}
              </p>
              <h3 className="text-3xl font-serif font-bold text-[#234d1b]">
                {kpi.value}
              </h3>
            </div>
            <div className={`p-4 rounded-2xl bg-gray-50 ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-4 border-b border-[#234d1b]/5">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#234d1b] tracking-tight">
            Inventory Management
          </h1>
          <p className="text-gray-400 mt-2 font-medium tracking-wide">
            Manage your product catalog, stock levels, and store inventory.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-[#f8bf51] to-[#D4B874] text-white px-8 py-4 rounded-xl flex items-center gap-3 font-bold uppercase tracking-wider text-xs shadow-lg shadow-[#f8bf51]/30 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group"
        >
          <Plus
            size={18}
            strokeWidth={3}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          Add New Product
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-30 py-4 bg-[#ece0cc]/80 backdrop-blur-md">
        <div className="relative w-full md:w-[480px] group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#f8bf51] transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search products by name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 focus:border-[#f8bf51]/50 rounded-2xl py-4 pl-14 pr-6 outline-none shadow-sm transition-all font-medium text-[#234d1b] placeholder:text-gray-300"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all shadow-sm uppercase tracking-widest text-[10px] ${
              showFilters
                ? "bg-[#234d1b] text-white border-[#234d1b]"
                : "bg-white border border-gray-100 text-gray-400 hover:text-[#234d1b] hover:border-[#234d1b]/20"
            }`}
          >
            <Filter size={16} /> Filter
            {(selectedCategory !== "all" || selectedStockStatus !== "all") && (
              <span className="w-2 h-2 bg-[#f8bf51] rounded-full animate-pulse" />
            )}
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-400 hover:text-[#234d1b] hover:border-[#234d1b]/20 transition-all shadow-sm uppercase tracking-widest text-[10px]">
            <Package size={16} /> Manage UOMs
          </button>
          <div className="w-px h-10 bg-gray-200 mx-2 hidden md:block"></div>
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#234d1b] transition-colors shadow-sm"
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#234d1b]">
                  Filter Products
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedStockStatus("all");
                  }}
                  className="text-xs font-bold text-[#f8bf51] hover:underline uppercase tracking-wider"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        selectedCategory === "all"
                          ? "bg-[#234d1b] text-white shadow-md"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      All
                    </button>
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                          selectedCategory === cat
                            ? "bg-[#234d1b] text-white shadow-md"
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Status Filter */}
                {manageInventory && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                      Stock Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "All", color: "gray" },
                        {
                          value: "in-stock",
                          label: "In Stock",
                          color: "green",
                        },
                        {
                          value: "low-stock",
                          label: "Low Stock",
                          color: "orange",
                        },
                        {
                          value: "out-of-stock",
                          label: "Out of Stock",
                          color: "red",
                        },
                      ].map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setSelectedStockStatus(status.value)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            selectedStockStatus === status.value
                              ? "bg-[#234d1b] text-white shadow-md"
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {status.value !== "all" && (
                            <div
                              className={`w-2 h-2 rounded-full ${
                                status.color === "green"
                                  ? "bg-green-500"
                                  : status.color === "orange"
                                    ? "bg-orange-500"
                                    : status.color === "red"
                                      ? "bg-red-500"
                                      : "bg-gray-400"
                              }`}
                            />
                          )}
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Filters Summary */}
              {(selectedCategory !== "all" ||
                selectedStockStatus !== "all") && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Active Filters:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory !== "all" && (
                      <span className="px-3 py-1 bg-[#ece0cc] text-[#234d1b] text-xs font-bold rounded-full flex items-center gap-2">
                        Category: {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedStockStatus !== "all" && (
                      <span className="px-3 py-1 bg-[#ece0cc] text-[#234d1b] text-xs font-bold rounded-full flex items-center gap-2">
                        Status:{" "}
                        {selectedStockStatus
                          .split("-")
                          .map(
                            (w) => w.charAt(0).toUpperCase() + w.slice(1),
                          )
                          .join(" ")}
                        <button
                          onClick={() => setSelectedStockStatus("all")}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List - Card Style Rows */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#f8bf51] border-t-transparent rounded-full animate-spin mb-6" />
            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">
              Loading Inventory...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-100">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-[#234d1b] mb-2">
              No Products Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              We couldn't find any products matching your search. Try adjusting
              your filters or add a new product.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#f8bf51] font-bold hover:underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredProducts.map((p, i) => {
              const status = getStockStatus(p);
              const totalStock =
                p.variants?.reduce(
                  (acc: number, v: any) => acc + (v.stock || 0),
                  0,
                ) ||
                p.stock ||
                0;
              const minPrice = p.variants?.length
                ? Math.min(...p.variants.map((v: any) => v.price))
                : p.price;

              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white rounded-[20px] p-4 border border-gray-100 hover:border-[#f8bf51]/30 hover:shadow-lg hover:shadow-[#f8bf51]/5 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
                >
                  {/* Decoration Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#234d1b] opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Image */}
                  <div className="w-full md:w-20 h-20 bg-[#ece0cc] rounded-2xl overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                    {p.images?.[0] ? (
                      <Image
                        src={p.images[0]}
                        className="w-full h-full object-cover"
                        alt={p.name}
                        fill
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#234d1b]/20">
                        <Package size={24} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-[#234d1b] leading-tight">
                        {p.name}
                      </h3>
                      <span className="px-3 py-1 bg-[#ece0cc] text-[#234d1b]/60 text-[10px] font-black uppercase tracking-widest rounded-full w-fit mx-auto md:mx-0 border border-[#234d1b]/5">
                        {p.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-gray-400">
                      <span>SKU: {p._id.substring(0, 6).toUpperCase()}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span>
                        {p.variants?.length
                          ? `${p.variants.length} Variants`
                          : "Single Item"}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end px-4 md:px-0 border-t md:border-none border-gray-50 pt-4 md:pt-0">
                    {/* Price */}
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                        Price
                      </p>
                      <p className="text-lg font-serif font-black text-[#234d1b]">
                        ₹{minPrice}
                      </p>
                    </div>

                    {/* Stock Status */}
                    <div className="text-center md:text-right min-w-[100px]">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                        Stock Level
                      </p>
                      <div className="flex items-center justify-center md:justify-end gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}
                        />
                        <span className={`font-bold text-sm ${status.text}`}>
                          {status.value}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#234d1b] hover:bg-[#ece0cc] transition-colors border border-transparent hover:border-gray-200"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p._id)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100" // Red action for delete needs to signal caution
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete()}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Confirm Delete"
        type="danger"
      />
    </div>
  );
}
