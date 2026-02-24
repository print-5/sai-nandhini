"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  ChevronRight,
  Layers,
  Scale,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "@/components/admin/ImageUpload";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCategory, setNewCategory] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<string | File>("");
  const [newSubCategory, setNewSubCategory] = useState({
    name: "",
    parentId: "",
  });
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await fetch("/api/admin/categories");
      setCategories(await catRes.json());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (catId: string) => {
    try {
      const res = await fetch(`/api/admin/subcategories?categoryId=${catId}`);
      const json = await res.json();
      setSubCategories(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error(error);
      setSubCategories([]);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory || !newCategoryImage) {
      return;
    }

    const slug = newCategory
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    try {
      const formData = new FormData();
      formData.append("name", newCategory);
      formData.append("slug", slug);

      if (newCategoryImage instanceof File) {
        formData.append("file", newCategoryImage);
      } else {
        formData.append("image", newCategoryImage);
      }

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Category added successfully");
        setNewCategory("");
        setNewCategoryImage("");
        fetchData();
      } else {
        toast.error("Failed to add category");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${deleteCatId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Category deleted");
        fetchData();
        if (newSubCategory.parentId === deleteCatId) {
          setNewSubCategory({ ...newSubCategory, parentId: "" });
          setSubCategories([]);
        }
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setDeleting(false);
      setDeleteCatId(null);
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCategory.name || !newSubCategory.parentId) return;
    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubCategory.name,
          categoryId: newSubCategory.parentId,
        }),
      });
      if (res.ok) {
        toast.success("Sub-category added");
        setNewSubCategory({ ...newSubCategory, name: "" });
        fetchSubCategories(newSubCategory.parentId);
      } else {
        toast.error("Failed to add sub-category");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleDeleteSubCategory = async () => {
    if (!deleteSubId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/subcategories?id=${deleteSubId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Sub-category deleted");
        fetchSubCategories(newSubCategory.parentId);
      } else {
        toast.error("Failed to delete sub-category");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setDeleting(false);
      setDeleteSubId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#2F3E2C]/5 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#2F3E2C] tracking-tight">
            Master Settings
          </h1>
          <p className="text-gray-400 mt-2 font-medium tracking-wide">
            Configure product hierarchy.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#C6A75E] border-t-transparent rounded-full animate-spin mb-6" />
          <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">
            Loading Configuration...
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Parent Categories */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#2F3E2C] mb-6">
                  Parent Categories
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New Category Name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-grow bg-[#F8F6F2] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#C6A75E]/50 transition-all font-bold text-[#2F3E2C] placeholder:font-medium placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory || !newCategoryImage}
                      className="bg-[#2F3E2C] text-white p-3 rounded-xl hover:bg-[#1f2b1d] transition-all shadow-lg active:scale-95 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Image Upload Area */}
                  <ImageUpload
                    value={newCategoryImage}
                    onChange={(val) => setNewCategoryImage(val)}
                  />

                  {(!newCategory || !newCategoryImage) && (
                    <p className="text-[10px] text-gray-400 pl-1">
                      * Both fields are required to add a category.
                    </p>
                  )}
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat, i) => (
                    <div
                      key={cat._id}
                      onClick={() => {
                        setNewSubCategory({
                          ...newSubCategory,
                          parentId: cat._id,
                        });
                        fetchSubCategories(cat._id);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer group flex justify-between items-center ${newSubCategory.parentId === cat._id ? "bg-[#2F3E2C] border-[#2F3E2C] text-white shadow-lg ring-4 ring-[#2F3E2C]/10" : "bg-white border-gray-100 hover:border-[#C6A75E]/50 hover:bg-[#F8F6F2]"}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${newSubCategory.parentId === cat._id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}
                        >
                          {i + 1}
                        </span>
                        {cat.image && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 shrink-0">
                            <img
                              src={cat.image}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                        )}
                        <span
                          className={`font-bold truncate ${newSubCategory.parentId === cat._id ? "text-white" : "text-[#2F3E2C]"}`}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCatId(cat._id);
                          }}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight
                          size={16}
                          className={`transition-transform shrink-0 ${newSubCategory.parentId === cat._id ? "text-white rotate-90" : "text-gray-300"}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub Categories */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <Layers size={200} className="text-[#2F3E2C]" />
                </div>

                <div className="relative z-10 flex-grow">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#2F3E2C] mb-8 flex items-center gap-2">
                    Sub Categories
                    {newSubCategory.parentId && (
                      <span className="bg-[#C6A75E]/10 text-[#C6A75E] px-2 py-0.5 rounded text-[10px] ml-2">
                        {
                          categories.find(
                            (c) => c._id === newSubCategory.parentId,
                          )?.name
                        }
                      </span>
                    )}
                  </h3>

                  {newSubCategory.parentId ? (
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          placeholder="New Sub-Category Name"
                          value={newSubCategory.name}
                          onChange={(e) =>
                            setNewSubCategory({
                              ...newSubCategory,
                              name: e.target.value,
                            })
                          }
                          className="flex-grow bg-[#F8F6F2] border-none rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#C6A75E]/50 transition-all font-bold text-[#2F3E2C] placeholder:font-medium placeholder:text-gray-400"
                        />
                        <button
                          onClick={handleAddSubCategory}
                          className="bg-[#C6A75E] text-white px-6 rounded-xl hover:bg-[#b0934e] transition-all shadow-lg active:scale-95 font-bold uppercase tracking-widest text-xs"
                        >
                          Add Item
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subCategories.length === 0 ? (
                          <div className="col-span-2 text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                              No sub-categories found
                            </p>
                          </div>
                        ) : (
                          subCategories.map((sub, i) => (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              key={sub._id}
                              className="p-4 bg-[#F8F6F2] rounded-xl border border-gray-200/50 flex justify-between items-center group hover:border-[#C6A75E]/30 transition-all"
                            >
                              <span className="font-bold text-[#2F3E2C]">
                                {sub.name}
                              </span>
                              <button
                                onClick={() => setDeleteSubId(sub._id)}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 hover:text-red-500 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 min-h-[300px]">
                      <Layers size={48} className="mb-4 text-[#2F3E2C]" />
                      <p className="text-xs font-black uppercase tracking-widest text-[#2F3E2C]">
                        Select a parent category
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        to manage its sub-groups
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <ConfirmationModal
        isOpen={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this category? All its sub-categories will be affected."
        confirmText="Delete Category"
        type="danger"
      />

      <ConfirmationModal
        isOpen={!!deleteSubId}
        onClose={() => setDeleteSubId(null)}
        onConfirm={handleDeleteSubCategory}
        title="Delete Sub-Category"
        message="Are you sure you want to delete this sub-category?"
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
