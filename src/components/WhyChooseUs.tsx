"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Coffee, Leaf, Flame, CheckCircle2 } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Coffee,
      title: "Traditional Recipes",
      desc: "Heritage bakes refined over 25 years. Our recipes are family heirlooms — not from a lab or an algorithm.",
    },
    {
      icon: Leaf,
      title: "Premium Ingredients",
      desc: "Stone-ground whole wheat, native millets, and farm-sourced jaggery. You'll taste the real difference.",
    },
    {
      icon: Flame,
      title: "Wood-Fired Freshness",
      desc: "Baked in traditional wood-fired ovens every morning. From our kitchen to your table in hours, not days.",
    },
  ];

  return (
    <section className="py-28 bg-[#2F3E2C] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C6A75E]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/3 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Content */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C6A75E] mb-5 block">
              Why Choose Us
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-black text-white tracking-tight leading-[1.05] mb-8">
              No Shortcuts. <br className="hidden md:block" />
              No <span className="text-[#C6A75E] italic">Compromises.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-12 max-w-md">
              Every product we make carries a promise — pure, authentic, and
              crafted the traditional way.
            </p>

            <div className="space-y-8">
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  viewport={{ once: true }}
                  className="flex gap-5 group"
                >
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#C6A75E] group-hover:scale-105 transition-all">
                    <item.icon
                      size={24}
                      className="text-[#C6A75E] group-hover:text-[#2F3E2C] transition-colors"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-white/50 leading-relaxed">
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
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl shadow-black/30 relative">
              <Image
                src="https://images.pexels.com/photos/4686958/pexels-photo-4686958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                alt="Our kitchen in action"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-[#2F3E2C]/10 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Stats badge */}
            <div className="absolute -bottom-6 -left-6 bg-[#C6A75E] p-7 rounded-3xl shadow-2xl">
              <p className="text-4xl font-serif font-black text-[#2F3E2C] mb-1">
                25+
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#2F3E2C]/70">
                Years of Heritage
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
