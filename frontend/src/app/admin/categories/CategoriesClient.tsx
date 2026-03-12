"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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

export default function CategoriesClient({
  initialData,
}: {
  initialData: any[];
}) {
  const [categories, setCategories] = useState<any[]>(initialData);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState<string | File>("");
  const [newSubCategory, setNewSubCategory] = useState({
    name: "",
    parentId: "",
  });
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState<string | File>("");
  const [editCategorySlug, setEditCategorySlug] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const subCategoryCounts = categories.reduce((acc, cat) => {
    // This assumes we have all subcategories or can derive them.
    // For now, we'll just show the count of current subCategories if the parent matches,
    // but better would be a count from the DB or a pre-fetched list.
    return acc;
  }, {});

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await fetch("/api/admin/categories", {
        credentials: "include"
      });
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
      const res = await fetch(`/api/admin/subcategories?categoryId=${catId}`, {
        credentials: "include"
      });
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
        credentials: "include",
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
        credentials: "include"
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
        credentials: "include",
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
        credentials: "include"
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

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryImage(category.image || "");
    setEditCategorySlug(category.slug);
    setEditCategoryDescription(category.description || "");
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName || !editCategoryImage) {
      toast.error("Name and image are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", editCategoryName);
      formData.append("slug", editCategorySlug);
      formData.append("description", editCategoryDescription);

      if (editCategoryImage instanceof File) {
        formData.append("file", editCategoryImage);
      } else {
        formData.append("image", editCategoryImage);
      }

      const res = await fetch(
        `/api/admin/categories?id=${editingCategory._id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );

      if (res.ok) {
        toast.success("Category updated successfully");
        setEditingCategory(null);
        setEditCategoryName("");
        setEditCategoryImage("");
        setEditCategorySlug("");
        setEditCategoryDescription("");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update category");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryImage("");
    setEditCategorySlug("");
    setEditCategoryDescription("");
  };

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 border-b border-[#234d1b]/5 pb-4 sm:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-[#234d1b] tracking-tight text-balance leading-tight">
            Category Management
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2 font-medium tracking-wide text-[11px] sm:text-xs md:text-sm">
            Organize and manage your product hierarchy.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#f8bf51] border-t-transparent rounded-full animate-spin mb-6" />
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#234d1b]">
                    Categories
                  </h3>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {categories.length} Total
                  </div>
                </div>

                {/* Categories Search */}
                <div className="relative mb-6 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers
                      size={14}
                      className="text-gray-300 group-focus-within:text-[#f8bf51] transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#234d1b] outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:border-[#f8bf51]/50 focus:ring-2 focus:ring-[#f8bf51]/10"
                  />
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New Name..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-grow bg-[#ece0cc] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#f8bf51]/50 transition-shadow font-bold text-[#234d1b] placeholder:font-medium placeholder:text-gray-400 text-sm"
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory || !newCategoryImage}
                      className="bg-[#234d1b] text-white p-3 rounded-xl hover:bg-[#234d1b] transition-transform shadow-lg active:scale-95 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation"
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
                  {categories
                    .filter((c) =>
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((cat, i) => (
                      <div
                        key={cat._id}
                        onClick={() => {
                          setNewSubCategory({
                            ...newSubCategory,
                            parentId: cat._id,
                          });
                          fetchSubCategories(cat._id);
                          // Mobile auto-scroll
                          if (window.innerWidth < 1024) {
                            document
                              .getElementById("sub-categories-section")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className={`p-3 sm:p-4 rounded-xl border transition-colors cursor-pointer group flex justify-between items-center ${newSubCategory.parentId === cat._id ? "bg-[#234d1b] border-[#234d1b] text-white shadow-lg sm:ring-4 ring-[#234d1b]/10" : "bg-white border-gray-100 font-medium hover:border-[#234d1b]/5 hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white/10 shrink-0 relative shadow-inner">
                            <Image
                              src={cat.image}
                              className="object-cover"
                              alt=""
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`font-black text-xs sm:text-sm truncate block ${newSubCategory.parentId === cat._id ? "text-white" : "text-[#234d1b]"}`}
                            >
                              {cat.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-widest ${newSubCategory.parentId === cat._id ? "text-white/60" : "text-gray-400"}`}
                            >
                              Manage Sub-items
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCategory(cat);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation ${newSubCategory.parentId === cat._id ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-400 hover:bg-blue-500 hover:text-white"}`}
                            aria-label="Edit category"
                          >
                            <Edit2 size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteCatId(cat._id);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation ${newSubCategory.parentId === cat._id ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white"}`}
                            aria-label="Delete category"
                          >
                            <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <ChevronRight
                            size={14}
                            className={`transition-transform shrink-0 ${newSubCategory.parentId === cat._id ? "text-white rotate-90" : "text-gray-300"}`}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Sub Categories */}
            <div
              className="lg:col-span-7 space-y-6"
              id="sub-categories-section"
            >
              <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <Layers size={200} className="text-[#234d1b]" />
                </div>

                <div className="relative z-10 flex-grow">
                  <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-[#234d1b] mb-4 sm:mb-8 flex flex-wrap items-center gap-2">
                    Sub Categories
                    {newSubCategory.parentId && (
                      <span className="bg-[#f8bf51]/10 text-[#f8bf51] px-2 py-0.5 rounded text-[8px] sm:text-[10px]">
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
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Sub-Category Name..."
                          value={newSubCategory.name}
                          onChange={(e) =>
                            setNewSubCategory({
                              ...newSubCategory,
                              name: e.target.value,
                            })
                          }
                          className="flex-grow bg-[#ece0cc] border-none rounded-xl px-4 sm:px-6 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#f8bf51]/50 transition-shadow font-bold text-[#234d1b] placeholder:font-medium placeholder:text-gray-400 text-sm"
                        />
                        <button
                          onClick={handleAddSubCategory}
                          className="bg-[#f8bf51] text-white px-6 py-3 sm:py-4 rounded-xl hover:bg-[#b0934e] transition-colors shadow-lg active:scale-95 font-bold uppercase tracking-widest text-[10px] sm:text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation whitespace-nowrap"
                        >
                          Add Item
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {subCategories.length === 0 ? (
                          <div className="col-span-full text-center py-8 sm:py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                            <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                              No items found
                            </p>
                          </div>
                        ) : (
                          subCategories.map((sub, i) => (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              key={sub._id}
                              className="p-3 sm:p-4 bg-[#ece0cc] rounded-xl border border-gray-200/50 flex justify-between items-center group hover:border-[#f8bf51]/30 transition-colors"
                            >
                              <span className="font-bold text-[#234d1b] text-xs sm:text-sm truncate pr-2">
                                {sub.name}
                              </span>
                              <button
                                onClick={() => setDeleteSubId(sub._id)}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-gray-300 hover:text-red-500 hover:shadow-sm transition-colors sm:opacity-0 group-hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation shrink-0"
                                aria-label={`Delete sub-category ${sub.name}`}
                              >
                                <Trash2
                                  size={12}
                                  className="sm:w-3.5 sm:h-3.5"
                                />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 min-h-[300px]">
                      <Layers size={48} className="mb-4 text-[#234d1b]" />
                      <p className="text-xs font-black uppercase tracking-widest text-[#234d1b]">
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

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancelEdit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-[#234d1b]">
                  Edit Category
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation"
                  aria-label="Close modal"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editCategoryName}
                    onChange={(e) => {
                      setEditCategoryName(e.target.value);
                      setEditCategorySlug(
                        e.target.value
                          .toLowerCase()
                          .trim()
                          .replace(/ /g, "-")
                          .replace(/[^\w-]+/g, ""),
                      );
                    }}
                    className="w-full bg-[#ece0cc] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#f8bf51]/50 transition-shadow font-bold text-[#234d1b]"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={editCategorySlug}
                    onChange={(e) => setEditCategorySlug(e.target.value)}
                    className="w-full bg-[#ece0cc] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#f8bf51]/50 transition-shadow font-bold text-[#234d1b]"
                    placeholder="category-slug"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={editCategoryDescription}
                    onChange={(e) => setEditCategoryDescription(e.target.value)}
                    className="w-full bg-[#ece0cc] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#f8bf51]/50 transition-all font-bold text-[#234d1b] min-h-[100px]"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Category Image
                  </label>
                  <ImageUpload
                    value={editCategoryImage}
                    onChange={(val) => setEditCategoryImage(val)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 transition-colors font-bold uppercase tracking-widest text-[10px] sm:text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCategory}
                    disabled={!editCategoryName || !editCategoryImage}
                    className="flex-1 bg-[#234d1b] text-white py-3 rounded-xl hover:bg-[#1a3614] transition-colors font-bold uppercase tracking-widest text-[10px] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation"
                  >
                    <Save size={16} />
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
