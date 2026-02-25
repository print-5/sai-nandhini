"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Zap, Utensils } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/30 -z-10 rounded-l-[10rem]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
              Our Heritage
            </span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-primary-dark leading-tight mb-8">
              Preserving the <span className="text-primary italic">Soul</span>{" "}
              of South India.
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed font-medium">
              At Sai Nandhini Tasty World, we believe that food is more than
              just sustenance; it's a legacy. Founded on the principles of
              authenticity and purity, we bring the timeless recipes of our
              grandmothers' kitchens to your doorstep.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="w-full aspect-square rounded-[4rem] overflow-hidden shadow-2xl skew-y-3 bg-gray-100 relative">
              <Image
                src="https://images.pexels.com/photos/4134783/pexels-photo-4134783.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Our Traditional Kitchen"
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-xl max-w-xs -skew-y-3 border border-gray-100">
              <p className="text-primary-dark font-serif font-bold text-lg leading-relaxed">
                "The secret ingredient is always love and a pinch of tradition."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 bg-primary-dark text-white rounded-[10rem] mx-4 md:mx-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Our Core Values
            </h2>
            <div className="w-24 h-1 bg-accent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                title: "Pure Authenticity",
                desc: "No artificial colors or preservatives. Just pure, home-made ingredients sourced directly from farmers.",
                icon: ShieldCheck,
              },
              {
                title: "Crafted with Love",
                desc: "Every batch of our Sambar powder and sweets is hand-crafted to maintain that nostalgic homemade taste.",
                icon: Heart,
              },
              {
                title: "Fast Tradition",
                desc: "Traditional flavors delivered with modern speed. We ensure your favorites reach you as fresh as they were made.",
                icon: Zap,
              },
            ].map((val, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-accent group-hover:text-primary-dark transition-all duration-500 rotate-45">
                  <val.icon size={32} className="-rotate-45" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">
                  {val.title}
                </h3>
                <p className="text-primary-light font-medium leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culinary Journey */}
      <section className="py-32 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div className="order-2 lg:order-1 relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-square mt-10">
              <Image
                src="https://images.pexels.com/photos/674483/pexels-photo-674483.jpeg?auto=compress&cs=tinysrgb&w=800"
                className="rounded-3xl shadow-lg w-full h-full object-cover"
                alt="Spices"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="relative aspect-square">
              <Image
                src="https://images.pexels.com/photos/1055271/pexels-photo-1055271.jpeg?auto=compress&cs=tinysrgb&w=800"
                className="rounded-3xl shadow-lg w-full h-full object-cover"
                alt="Sweets"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Utensils className="text-primary mb-6" size={40} />
          <h2 className="text-5xl font-serif font-bold text-primary-dark mb-8">
            From Our Family To Yours.
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed font-medium mb-10">
            Sai Nandhini started as a small kitchen experiment by a family of
            food enthusiasts who couldn't find the authentic taste of home in
            store-bought products. Today, we've grown into a community of
            thousands who share the same love for traditional South Indian
            delicacies.
          </p>
          <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-10">
            <div>
              <p className="text-4xl font-bold text-primary mb-1">10k+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Happy Customers
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-1">50+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Secret Recipes
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
