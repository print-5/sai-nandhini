"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CategorySection({
  initialCategories,
}: {
  initialCategories: any[];
}) {
  const [categories] = useState<any[]>(initialCategories);
  const [loading] = useState(false);

  if (loading) return null;
  if (categories.length === 0) return null;

  return (
    <section className="py-24 bg-[#F8F6F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C6A75E] mb-3 block">
            Explore Our Range
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-black text-[#2F3E2C] tracking-tight">
            Curated for Every{" "}
            <span className="text-[#C6A75E] italic">Taste</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
            From tangy pickles to melt-in-your-mouth sweets — discover our
            handcrafted collection.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative block h-[380px] rounded-3xl overflow-hidden shadow-lg shadow-[#2F3E2C]/5"
              >
                <Image
                  src={
                    cat.image ||
                    "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800"
                  }
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2F3E2C]/90 via-[#2F3E2C]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute inset-x-0 bottom-0 p-7">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A75E]/90 mb-1.5 block">
                    {cat.description || "Fresh & Authentic"}
                  </span>
                  <h3 className="text-2xl font-serif font-black text-white mb-4 leading-tight">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/80 group-hover:text-[#C6A75E] transition-colors">
                    Shop Collection{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1.5 transition-transform"
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
