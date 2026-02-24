"use client";

import { useState, useEffect } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string | File;
  onChange: (value: string | File) => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  className = "",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!value) {
      setPreview("");
      return;
    }

    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      onChange(file);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
          {label}
        </span>
      )}

      <div className="flex flex-col gap-4">
        {preview ? (
          <div className="relative group w-full aspect-video md:aspect-[2/1] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <label className="w-full aspect-video md:aspect-[2/1] border-2 border-dashed border-gray-200 hover:border-[#C6A75E] rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50/50 hover:bg-white transition-all group active:scale-[0.98]">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-[#C6A75E] group-hover:scale-110 transition-all shadow-sm mb-3">
              <Upload size={24} />
            </div>
            <p className="text-[11px] font-black text-[#2F3E2C] uppercase tracking-widest mb-1">
              Select Asset
            </p>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">
              PNG, JPG or WebP (Max 2MB)
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
