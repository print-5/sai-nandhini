"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Coffee, Leaf, Flame } from "lucide-react";

const features = [
  {
    icon: Coffee,
    title: "Traditional Recipes",
    desc: "Heritage bakes refined over 25 years. Our recipes are family heirlooms — not from a lab or an algorithm.",
    num: "01",
  },
  {
    icon: Leaf,
    title: "Premium Ingredients",
    desc: "Stone-ground whole wheat, native millets, and farm-sourced jaggery. You'll taste the real difference.",
    num: "02",
  },
  {
    icon: Flame,
    title: "Wood-Fired Freshness",
    desc: "Baked in traditional wood-fired ovens every morning. From our kitchen to your table in hours, not days.",
    num: "03",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-28 bg-[#234d1b] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#f8bf51]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(248,191,81,0.5) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f8bf51] mb-5 block">
                Why Choose Us
              </span>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight leading-[1.05] mb-3">
                No Shortcuts. <br className="hidden md:block" />
                No <span className="text-[#f8bf51] italic">Compromises.</span>
              </h2>
              <div className="w-16 h-1 bg-[#f8bf51] rounded-full mb-8" />
              <p className="text-white/40 text-base leading-relaxed mb-12 max-w-md">
                Every product we make carries a promise — pure, authentic, and
                crafted the traditional way.
              </p>
            </motion.div>

            <div className="space-y-6">
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  viewport={{ once: true }}
                  className="flex gap-5 group p-5 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
                >
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#f8bf51] group-hover:scale-105 transition-all duration-300 shadow-lg shadow-black/10">
                    <item.icon
                      size={24}
                      className="text-[#f8bf51] group-hover:text-[#234d1b] transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold text-[#f8bf51]/30 tracking-widest">
                        {item.num}
                      </span>
                      <h4 className="text-xl font-bold text-white">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/30 relative">
              <Image
                src="https://images.pexels.com/photos/4686958/pexels-photo-4686958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                alt="Our kitchen in action"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#234d1b]/40 via-transparent to-transparent" />
            </div>

            {/* Stats badge */}
            <div className="absolute -bottom-6 -left-6 bg-[#f8bf51] p-7 rounded-3xl shadow-2xl shadow-black/20">
              <p className="text-4xl font-serif font-black text-[#234d1b] mb-1">
                25+
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#234d1b]/70">
                Years of Heritage
              </p>
            </div>

            {/* Secondary badge */}
            <div className="absolute -top-4 -right-4 bg-white p-5 rounded-2xl shadow-2xl shadow-black/10">
              <p className="text-2xl font-serif font-black text-[#234d1b] mb-0.5">
                10K+
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#234d1b]/50">
                Happy Customers
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
