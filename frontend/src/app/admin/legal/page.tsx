"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Save, FileText } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminLegalPages() {
  const [selectedPage, setSelectedPage] = useState<string>("terms");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [selectedPage]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/page?slug=${selectedPage}`, {
        credentials: "include"
      });
      const data = await res.json();
      setTitle(data.title || defaultTitles[selectedPage]);
      setContent(data.content || "");
    } catch (err) {
      console.error("Failed to fetch page:", err);
      toast.error("Failed to load page content.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug: selectedPage, title, content }),
      });

      if (res.ok) {
        toast.success("Page saved successfully!");
        fetchPage(); // Refresh
      } else {
        toast.error("Failed to save page.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving page.");
    } finally {
      setSaving(false);
    }
  };

  const defaultTitles: Record<string, string> = {
    terms: "Terms and Conditions",
    privacy: "Privacy Policy",
    shipping: "Shipping Policy",
    returns: "Refund Policy",
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-5 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-serif font-black text-primary-dark leading-tight">
            Legal Pages
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-[10px] sm:text-sm">
            Edit Terms, Privacy, and other mandatory legal policies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide snap-x transition-all">
          {Object.keys(defaultTitles).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedPage(key)}
              className={`whitespace-nowrap md:whitespace-normal px-6 py-4 rounded-xl font-black text-[10px] sm:text-sm transition-all flex items-center justify-between shrink-0 snap-start focus:ring-4 focus:ring-primary/10 touch-manipulation ${
                selectedPage === key
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100 hover:border-gray-200"
              }`}
            >
              {defaultTitles[key]}
              <FileText
                size={16}
                className={`ml-4 shrink-0 transition-opacity ${selectedPage === key ? "opacity-100" : "opacity-0 md:group-hover:opacity-50"}`}
              />
            </button>
          ))}
        </div>

        {/* Editor Content */}
        <div className="md:col-span-3 bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[2rem] z-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-lg sm:text-xl font-serif font-black text-primary-dark p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all placeholder:text-gray-200"
                  placeholder="Enter Page Title"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Content (Markdown / HTML)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[350px] sm:h-[400px] p-5 sm:p-6 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-mono text-[13px] sm:text-sm leading-relaxed resize-none shadow-inner"
                  placeholder="Start typing your policy content here..."
                />
                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                  Tip: You can use basic HTML tags for formatting (e.g.,
                  &lt;b&gt;, &lt;h2&gt;, &lt;ul&gt;).
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving || !title || !content}
                  className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 touch-manipulation focus:ring-4 focus:ring-primary/10"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
