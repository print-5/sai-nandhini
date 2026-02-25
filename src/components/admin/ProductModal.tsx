"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Upload, Loader2, ChevronDown, Check, Save } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  product?: any;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
}: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "" as any,
    category: "",
    subCategory: "",
    stock: "" as any,
    badge: "",
    isFeatured: false,
    isCodAvailable: true,
    variants: [] as any[],
    images: [] as any[], // Allow strings or Files
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
    },
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [uoms, setUoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [manageInventory, setManageInventory] = useState(true);

  // Fetch master data
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [catRes, uomRes, settingsRes] = await Promise.all([
            fetch("/api/admin/categories"),
            fetch("/api/admin/uom"),
            fetch("/api/admin/settings"),
          ]);
          const cats = await catRes.json();
          const uomsData = await uomRes.json();
          const settings = await settingsRes.json();
          setCategories(cats);
          setUoms(uomsData);
          setManageInventory(settings.manageInventory ?? true);
        } catch (error) {
          console.error("Failed to fetch master data", error);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const fetchSubs = async () => {
        try {
          // Find category  ID
          const cat = categories.find(
            (c) => c.name === formData.category || c._id === formData.category,
          );
          if (cat) {
            const res = await fetch(
              `/api/admin/subcategories?category=${cat._id}`,
            );
            const subs = await res.json();
            setSubCategories(subs);
          }
        } catch (error) {
          console.error("Failed to fetch subcategories", error);
        }
      };
      fetchSubs();
    } else {
      setSubCategories([]);
    }
  }, [formData.category, categories]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        subCategory: product.subCategory || "",
        stock: product.stock || "",
        badge: product.badge || "",
        isFeatured: product.isFeatured || false,
        isCodAvailable: product.isCodAvailable !== false,
        variants: product.variants || [],
        images: product.images || [],
        seo: product.seo || {
          metaTitle: "",
          metaDescription: "",
          keywords: "",
        },
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        category: "",
        subCategory: "",
        stock: "",
        badge: "",
        isFeatured: false,
        isCodAvailable: true,
        variants: [],
        images: [],
        seo: {
          metaTitle: "",
          metaDescription: "",
          keywords: "",
        },
      });
    }
  }, [product, isOpen]);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setFormData({ ...formData, name, slug });
  };

  const handleVariantChange = (
    uomName: string,
    field: "price" | "stock" | "checked",
    value: any,
  ) => {
    let newVariants = [...formData.variants];
    const existingIndex = newVariants.findIndex((v) => v.uom === uomName);

    if (field === "checked") {
      if (value) {
        if (existingIndex === -1) {
          newVariants.push({ uom: uomName, price: 0, stock: 0 });
        }
      } else {
        if (existingIndex !== -1) {
          newVariants.splice(existingIndex, 1);
        }
      }
    } else {
      if (existingIndex !== -1) {
        newVariants[existingIndex] = {
          ...newVariants[existingIndex],
          [field]: Number(value),
        };
      }
    }

    let basePrice = formData.price;
    let baseStock = formData.stock;

    if (newVariants.length > 0) {
      basePrice = newVariants[0].price;
      baseStock = newVariants.reduce((acc, curr) => acc + (curr.stock || 0), 0);
    }

    setFormData({
      ...formData,
      variants: newVariants,
      price: basePrice,
      stock: baseStock,
    });
  };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 4) {
      toast.error("Maximum 4 images allowed per product.");
      return;
    }

    // Just push the local File objects directly into the array
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    const existingImages = formData.images.filter(
      (img) => typeof img === "string",
    );
    const newFileImages = formData.images.filter(
      (img) => typeof img !== "string",
    ) as File[];

    // append metadata as JSON string for easy parsing on backend
    data.append(
      "data",
      JSON.stringify({ ...formData, images: existingImages }),
    );

    // append files
    newFileImages.forEach((file) => {
      data.append("newImages", file);
    });

    await onSave(data);
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2F3E2C]/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#F8F6F2]">
              <div>
                <h2 className="text-3xl font-serif font-black text-[#2F3E2C]">
                  {product ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-1">
                  Configure product details and pricing variants
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:rotate-90 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-grow overflow-y-auto p-10 custom-scrollbar"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Basic Info */}
                <div className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#2F3E2C] border-b border-[#2F3E2C]/10 pb-2">
                    Product Information
                  </h3>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full bg-[#F8F6F2] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#C6A75E]/30 transition-all font-bold text-[#2F3E2C] placeholder:text-gray-300"
                      placeholder="e.g. Signature Red Velvet Cake"
                    />
                    <p className="text-[10px] text-gray-400 font-mono mt-1 ml-1 tracking-wider uppercase opacity-50">
                      /{formData.slug}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-[#F8F6F2] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#C6A75E]/30 transition-all font-medium text-[#2F3E2C] placeholder:text-gray-300 resize-none"
                      placeholder="Describe your product..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={formData.category} // Assuming category name is stored
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          className="w-full bg-[#F8F6F2] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#C6A75E]/30 transition-all font-bold text-[#2F3E2C] appearance-none cursor-pointer"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          size={16}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Sub Category
                      </label>
                      <div className="relative">
                        <select
                          value={formData.subCategory}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subCategory: e.target.value,
                            })
                          }
                          className="w-full bg-[#F8F6F2] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#C6A75E]/30 transition-all font-bold text-[#2F3E2C] appearance-none cursor-pointer"
                          disabled={!formData.category}
                        >
                          <option value="">Select Sub Category</option>
                          {subCategories.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          size={16}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Badge
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) =>
                          setFormData({ ...formData, badge: e.target.value })
                        }
                        className="w-full bg-[#F8F6F2] border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#C6A75E]/30 transition-all font-bold text-[#2F3E2C]"
                        placeholder="e.g. Bestseller"
                      />
                    </div>
                    <div className="flex flex-col justify-end gap-3 pb-2">
                      <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-[#F8F6F2] transition-colors">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.isFeatured ? "bg-[#C6A75E] border-[#C6A75E]" : "border-gray-300 group-hover:border-[#C6A75E]"}`}
                        >
                          {formData.isFeatured && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isFeatured: e.target.checked,
                            })
                          }
                        />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#2F3E2C] transition-colors">
                          Featured
                        </span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-[#F8F6F2] transition-colors">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.isCodAvailable ? "bg-[#2F3E2C] border-[#2F3E2C]" : "border-gray-300 group-hover:border-[#2F3E2C]"}`}
                        >
                          {formData.isCodAvailable && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={formData.isCodAvailable}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isCodAvailable: e.target.checked,
                            })
                          }
                        />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#2F3E2C] transition-colors">
                          COD Available
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Image Upload Area */}
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Product Images ({formData.images.length}/4)
                      </h3>
                      {uploading && (
                        <span className="text-xs text-[#C6A75E] font-bold animate-pulse">
                          Uploading...
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {/* Existing Images */}
                      {formData.images.map((img, index) => {
                        const displayUrl =
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img);
                        return (
                          <div
                            key={index}
                            className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm"
                          >
                            <Image
                              src={displayUrl}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                              fill
                              unoptimized
                              sizes="100px"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...formData.images];
                                newImages.splice(index, 1);
                                setFormData({ ...formData, images: newImages });
                              }}
                              className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}

                      {/* Upload Button */}
                      {formData.images.length < 4 && (
                        <label className="aspect-square border-2 border-dashed border-gray-200 hover:border-[#C6A75E] rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-[#F8F6F2] hover:bg-[#F8F6F2]/50 transition-all group">
                          <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-300 group-hover:text-[#C6A75E] group-hover:scale-110 transition-all mb-2">
                            <Upload size={16} />
                          </div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#C6A75E]">
                            Add Image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Variants */}
                <div className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#2F3E2C] border-b border-[#2F3E2C]/10 pb-2">
                    Pricing & Variants (UOM)
                  </h3>

                  <div className="bg-[#F8F6F2] rounded-[32px] p-8 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {dataLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-[#C6A75E]" />
                      </div>
                    ) : uoms.length === 0 ? (
                      <div className="text-center p-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        No UOMs found. <br /> Check Global Settings.
                      </div>
                    ) : (
                      uoms.map((uom) => {
                        const isChecked = formData.variants.some(
                          (v) => v.uom === uom.name,
                        );
                        const variant = formData.variants.find(
                          (v) => v.uom === uom.name,
                        ) || { price: 0, stock: 0 };

                        return (
                          <div
                            key={uom._id}
                            className={`p-5 rounded-2xl transition-all border-2 ${isChecked ? "bg-white border-[#C6A75E] shadow-xl shadow-[#C6A75E]/5 scale-[1.02]" : "bg-transparent border-transparent hover:bg-white/50 hover:border-gray-200"}`}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <label className="flex items-center gap-3 cursor-pointer flex-grow">
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? "bg-[#C6A75E] border-[#C6A75E]" : "bg-white border-gray-300"}`}
                                >
                                  {isChecked && (
                                    <Check size={12} className="text-white" />
                                  )}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    handleVariantChange(
                                      uom.name,
                                      "checked",
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span
                                  className={`text-sm font-bold uppercase tracking-wider ${isChecked ? "text-[#2F3E2C]" : "text-gray-400"}`}
                                >
                                  {uom.name}
                                </span>
                              </label>
                            </div>

                            {isChecked && (
                              <div className="flex gap-4 pl-8 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="flex-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                                    Price (₹)
                                  </label>
                                  <input
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        uom.name,
                                        "price",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-[#f0ede6] border-none rounded-xl py-3 px-4 text-sm font-bold text-[#2F3E2C] outline-none focus:ring-2 focus:ring-[#C6A75E]/30"
                                  />
                                </div>
                                {manageInventory && (
                                  <div className="flex-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                                      Stock
                                    </label>
                                    <input
                                      type="number"
                                      value={variant.stock}
                                      onChange={(e) =>
                                        handleVariantChange(
                                          uom.name,
                                          "stock",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-[#f0ede6] border-none rounded-xl py-3 px-4 text-sm font-bold text-[#2F3E2C] outline-none focus:ring-2 focus:ring-[#C6A75E]/30"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="bg-[#fff9e6] p-4 rounded-2xl border border-[#ffeeba] flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#fae3ae] text-[#8a6d2b] flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      !
                    </div>
                    <p className="text-[10px] text-[#8a6d2b] font-bold leading-relaxed uppercase tracking-wide">
                      Pricing updates sync immediately. Ensure correct stock
                      levels to prevent oversight.
                    </p>
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#C6A75E] mb-6">
                  Search Engine Optimization (SEO)
                </h3>
                <div className="bg-[#F8F6F2] rounded-[32px] p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={formData.seo?.metaTitle || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seo: { ...formData.seo, metaTitle: e.target.value },
                          })
                        }
                        className="w-full bg-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#C6A75E]/30 transition-all font-bold text-[#2F3E2C] placeholder:text-gray-300"
                        placeholder="Custom Page Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.seo?.keywords || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seo: { ...formData.seo, keywords: e.target.value },
                          })
                        }
                        className="w-full bg-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#C6A75E]/30 transition-all font-medium text-[#2F3E2C] placeholder:text-gray-300"
                        placeholder="comma, separated, tags"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={5}
                      value={formData.seo?.metaDescription || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: {
                            ...formData.seo,
                            metaDescription: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#C6A75E]/30 transition-all font-medium text-[#2F3E2C] placeholder:text-gray-300 resize-none h-full"
                      placeholder="Brief description for search engines..."
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-8 border-t border-gray-100 bg-white flex justify-end gap-4 z-20">
              <button
                onClick={onClose}
                className="px-8 py-4 rounded-2xl font-black text-gray-300 hover:bg-gray-50 hover:text-[#2F3E2C] transition-all uppercase tracking-widest text-[10px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || uploading}
                className="px-10 py-4 bg-[#2F3E2C] text-white rounded-2xl font-black shadow-xl hover:bg-[#1f2b1d] transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 uppercase tracking-widest text-[10px]"
              >
                {(loading || uploading) && (
                  <Loader2 className="animate-spin" size={14} />
                )}
                {uploading
                  ? "Uploading..."
                  : product
                    ? "Save Changes"
                    : "Confirm & Add"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
