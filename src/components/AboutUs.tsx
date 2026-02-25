"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AboutUs() {
  return (
    <section className="py-28 bg-[#F8F6F2] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#2F3E2C] blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#C6A75E] blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-[#2F3E2C]/10 border-4 border-white">
              <Image
                src="https://images.pexels.com/photos/3983674/pexels-photo-3983674.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Our Chef Baking"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-lg max-w-[180px] border border-white/50">
                <p className="text-3xl font-serif font-black text-[#2F3E2C] mb-0.5">
                  25+
                </p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#2F3E2C]/50">
                  Years of Culinary Excellence
                </p>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C6A75E] mb-5 block">
              Our Story
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-[#2F3E2C] leading-tight mb-6 tracking-tight">
              Bringing the Authentic <br className="hidden md:block" />
              <span className="italic text-[#C6A75E]">Taste of Madurai</span> to
              Your Table.
            </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed font-medium">
              What started as a small family kitchen has grown into Madurai's
              most loved destination for premium sweets and savories. At Sai
              Nandhini, we don't just bake; we craft memories using traditional
              wood-fired techniques and locally sourced, pure ingredients.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "100% Natural Ingredients, No Preservatives",
                "Traditional Wood-Fired Baking Methods",
                "Daily Fresh Batches, Made with Love",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#2F3E2C]/10 flex items-center justify-center text-[#2F3E2C] shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[#2F3E2C] font-bold text-sm tracking-wide">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-3 bg-[#2F3E2C] text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-[#2F3E2C]/15 hover:bg-[#1f2b1d] transition-all active:scale-95 group"
            >
              Read Our Full Story
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
