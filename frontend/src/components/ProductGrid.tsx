"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ShoppingBag, Eye } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface ProductGridProps {
  products: any[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart();

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[#234d1b]/60 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
      {products.map((product, i) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col h-full group"
        >
          {/* Image Container */}
          <div className="relative rounded-2xl overflow-hidden bg-[#ece0cc]/60 aspect-square mb-4 border border-[#234d1b]/5 group-hover:shadow-xl group-hover:shadow-[#234d1b]/8 transition-all duration-500">
            <Link href={`/shop/${product.slug}`}>
              <Image
                src={
                  product.images && product.images[0]
                    ? product.images[0]
                    : "https://via.placeholder.com/400x400?text=No+Image"
                }
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </Link>

            {product.tag && (
              <div className="absolute top-3 left-3 bg-[#234d1b] text-white px-3.5 py-1.5 rounded-full shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {product.tag}
                </span>
              </div>
            )}

            {/* Discount Badge */}
            {product.mrp && product.mrp > product.price && (
              <div className="absolute top-3 right-3 bg-[#f8bf51] text-[#234d1b] px-2.5 py-1 rounded-full shadow-lg">
                <span className="text-[10px] font-bold">
                  {Math.round(
                    ((product.mrp - product.price) / product.mrp) * 100,
                  )}
                  % OFF
                </span>
              </div>
            )}

            {/* Hover overlay with actions */}
            <div className="absolute inset-0 bg-[#234d1b]/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Link
                  href={`/shop/${product.slug}`}
                  className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#f8bf51] hover:text-[#234d1b] text-[#234d1b] transition-colors"
                >
                  <Eye size={18} />
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product, 1);
                  }}
                  className="w-11 h-11 bg-[#234d1b] rounded-full flex items-center justify-center shadow-lg hover:bg-[#f8bf51] text-white hover:text-[#234d1b] transition-colors"
                >
                  <ShoppingBag size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col flex-grow px-1">
            <Link href={`/shop/${product.slug}`} className="block mb-2">
              <h3 className="text-base font-bold text-[#234d1b] leading-snug line-clamp-2 group-hover:text-[#f8bf51] transition-colors duration-300">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-[#234d1b]">
                  ₹{product.price}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-xs text-[#234d1b]/30 line-through font-medium">
                    ₹{product.mrp}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 bg-[#f8bf51]/15 px-2.5 py-1 rounded-full">
                <Star size={12} className="text-[#f8bf51] fill-[#f8bf51]" />
                <span className="text-xs font-bold text-[#234d1b]">
                  {product.rating || "4.8"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}