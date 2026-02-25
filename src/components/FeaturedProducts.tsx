"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";

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
        <div className="w-8 h-8 border-4 border-[#C6A75E] border-t-transparent rounded-full animate-spin"></div>
      </section>
    );

  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C6A75E] mb-3 block">
              Customer Favourites
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-[#2F3E2C] tracking-tight">
              Bestsellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-2 text-sm font-bold text-[#2F3E2C] hover:text-[#C6A75E] transition-colors border-b-2 border-[#2F3E2C]/10 hover:border-[#C6A75E] pb-1"
          >
            View All Products{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col h-full group"
            >
              {/* Image Container */}
              <div className="relative rounded-2xl overflow-hidden bg-[#F8F6F2] aspect-square mb-4 border border-gray-100 group-hover:shadow-xl group-hover:shadow-[#2F3E2C]/5 transition-all">
                <Link href={`/shop/${product.slug}`}>
                  <Image
                    src={
                      product.images && product.images[0]
                        ? product.images[0]
                        : "https://via.placeholder.com/400x400?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </Link>

                {product.tag && (
                  <div className="absolute top-3 left-3 bg-[#2F3E2C] text-white px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {product.tag}
                    </span>
                  </div>
                )}

                {/* Add to Cart overlay */}
                <div className="absolute inset-x-3 bottom-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product, 1);
                    }}
                    className="w-full bg-[#2F3E2C] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] shadow-lg flex items-center justify-center gap-2 hover:bg-[#1f2b1d] transition-colors"
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-grow">
                <Link href={`/shop/${product.slug}`} className="block mb-2">
                  <h3 className="text-base font-bold text-[#2F3E2C] leading-snug line-clamp-2 group-hover:text-[#C6A75E] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#C6A75E]">
                      ₹{product.price}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-[#F8F6F2] px-2 py-1 rounded-lg">
                    <Star size={12} className="text-[#C6A75E] fill-[#C6A75E]" />
                    <span className="text-xs font-bold text-[#2F3E2C]">
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
