"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ShoppingBag, ArrowRight, Eye } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function FeaturedProducts({
  initialProducts,
}: {
  initialProducts: any[];
}) {
  const { addToCart } = useCart();
  const [products] = useState<any[]>(initialProducts);
  const [loading] = useState(false);

  if (loading)
    return (
      <section className="py-24 bg-white flex justify-center">
        <div className="w-8 h-8 border-4 border-[#f8bf51] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );

  if (products.length === 0) return null;

  return (
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#f8bf51]/[0.03] rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#234d1b]/[0.03] rounded-full blur-[100px] translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f8bf51] mb-3 block">
              Customer Favourites
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-[#234d1b] tracking-tight">
              Bestsellers
            </h2>
            <div className="w-16 h-1 bg-[#f8bf51] rounded-full mt-4" />
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-2.5 text-sm font-bold text-[#234d1b] hover:text-[#f8bf51] transition-colors bg-[#234d1b]/5 hover:bg-[#f8bf51]/10 px-5 py-3 rounded-xl"
          >
            View All Products{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>

        {/* Product Grid */}
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
      </div>
    </section>
  );
}
