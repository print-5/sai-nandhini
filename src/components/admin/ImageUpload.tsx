"use client";

import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  endpoint: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "sainandhini/general",
  label,
  endpoint,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.secure_url);
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong during upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <span className="text-sm font-semibold text-gray-700 mb-1.5 block">
          {label}
        </span>
      )}

      <div className="flex flex-col gap-4">
        {value ? (
          <div className="relative group w-full aspect-video md:aspect-[2/1] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <label className="w-full aspect-video md:aspect-[2/1] border-2 border-dashed border-gray-200 hover:border-[#C6A75E] rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50/50 hover:bg-white transition-all group">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm mb-3 ${uploading ? "bg-white" : "bg-white text-gray-300 group-hover:text-[#C6A75E] group-hover:scale-110"}`}
            >
              {uploading ? (
                <Loader2 size={24} className="animate-spin text-[#C6A75E]" />
              ) : (
                <Upload size={24} />
              )}
            </div>
            {uploading ? (
              <p className="text-xs font-bold text-[#C6A75E] uppercase tracking-widest animate-pulse">
                Uploading Asset...
              </p>
            ) : (
              <>
                <p className="text-[11px] font-black text-[#2F3E2C] uppercase tracking-widest mb-1">
                  Click to Upload
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  PNG, JPG or WebP (Max 2MB)
                </p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
