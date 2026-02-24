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
      const res = await fetch(`/api/admin/page?slug=${selectedPage}`);
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
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary-dark">
            Legal Pages Management
          </h1>
          <p className="text-gray-400 mt-1 font-medium">
            Edit content for Terms, Privacy, and other legal pages.
          </p>
        </div>
        <div className="flex gap-4">
          {/* Add any global actions here if needed */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {Object.keys(defaultTitles).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedPage(key)}
              className={`w-full text-left px-6 py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-between ${
                selectedPage === key
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200"
              }`}
            >
              {defaultTitles[key]}
              {selectedPage === key && <FileText size={16} />}
            </button>
          ))}
        </div>

        {/* Editor Content */}
        <div className="md:col-span-3 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-[2rem] z-10">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xl font-serif font-bold text-primary-dark p-4 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all"
                  placeholder="Enter Page Title"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Content (Markdown / HTML Supported)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[400px] p-6 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-mono text-sm leading-relaxed resize-none"
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
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
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
