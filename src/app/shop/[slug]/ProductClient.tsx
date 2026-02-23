"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/pdp/ProductGallery";
import TrustBadges from "@/components/pdp/TrustBadges";
import RelatedProducts from "@/components/pdp/RelatedProducts";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  ChefHat,
  Leaf,
  Truck,
  Zap,
  MapPin,
  CheckCircle2,
  Clock,
  Users,
  ShieldAlert,
  ChevronDown,
  Info,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function ProductClient({
  product: initialProduct,
}: {
  product: any;
}) {
  const [product, setProduct] = useState<any>(initialProduct);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [price, setPrice] = useState(0);
  const [manageInventory, setManageInventory] = useState(true);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        setManageInventory(data.manageInventory ?? true);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();

    if (product) {
      if (product.variants && product.variants.length > 0) {
        // Find first in-stock variant if managing inventory
        const firstAvailable =
          product.variants.find((v: any) => v.stock > 0) || product.variants[0];
        setSelectedVariant(firstAvailable);
        setPrice(firstAvailable.price);
      } else {
        setPrice(product.price);
      }
    }
  }, [product]);

  const handleBuyNow = () => {
    addToCart({ ...product, price: price, uom: currentUom }, qty);
    router.push("/checkout");
  };

  const handlePincodeCheck = () => {
    if (!pincode) return;
    setPincodeStatus("checking");
    setTimeout(() => {
      // Mocking Chennai coverage
      if (pincode.startsWith("600")) {
        setPincodeStatus("valid");
      } else {
        setPincodeStatus("invalid");
      }
    }, 1000);
  };

  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-serif font-bold text-primary-dark mb-4 tracking-tighter">
          Product Not Found
        </h1>
        <a
          href="/shop"
          className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px]"
        >
          Back to Shop
        </a>
      </div>
    );

  const totalStock =
    product.variants && product.variants.length > 0
      ? product.variants.reduce(
          (acc: number, v: any) => acc + (v.stock || 0),
          0,
        )
      : product.stock || 0;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock =
    manageInventory &&
    (selectedVariant ? currentStock === 0 : totalStock === 0);
  const currentUom = selectedVariant ? selectedVariant.uom : product.uom;

  return (
    <main className="min-h-screen bg-white selection:bg-primary selection:text-white">
      <Navbar />

      <div className="pt-40 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-12 uppercase tracking-[0.2em]">
          <a href="/" className="hover:text-primary transition-colors">
            Home
          </a>
          <ChevronDown size={10} className="-rotate-90" />
          <a href="/shop" className="hover:text-primary transition-colors">
            Shop
          </a>
          <ChevronDown size={10} className="-rotate-90" />
          <span className="text-primary-dark">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left: Product Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Right: Product Info Stack */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Organic Certified
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} /> Baked fresh 4 hrs ago
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl md:text-6xl font-serif font-black text-primary-dark leading-[1.1] tracking-tighter">
                  {product.name}
                </h1>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: product.name,
                          text: `Check out ${product.name} on Sai Nandhini Tasty World!`,
                          url: window.location.href,
                        })
                        .catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }
                  }}
                  className="p-3 bg-secondary/10 hover:bg-secondary/30 rounded-full text-primary-dark transition-colors"
                  title="Share this product"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < 4 ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-sans font-black text-primary-dark">
                    4.9
                  </span>
                  <span className="text-[10px] font-sans font-bold text-primary/60 uppercase tracking-widest underline cursor-pointer">
                    128 Reviews
                  </span>
                </div>
                <div className="h-4 w-px bg-primary/10" />
                <div className="flex items-center gap-1 text-primary">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-sans font-black uppercase tracking-widest">
                    {isOutOfStock
                      ? "Out of Stock"
                      : manageInventory
                        ? "In Stock"
                        : "Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Proof & Urgency */}
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="bg-secondary/20 border border-secondary/30 flex items-center gap-3 px-6 py-4 rounded-[2rem]">
                <Users size={18} className="text-primary-dark" />
                <p className="text-xs font-sans font-bold text-primary-dark">
                  23 people bought this in the last 24 hours
                </p>
              </div>
              {manageInventory && currentStock < 10 && currentStock > 0 && (
                <div className="bg-accent/10 border border-accent/20 flex items-center gap-3 px-6 py-4 rounded-[2rem]">
                  <ShieldAlert size={18} className="text-accent" />
                  <p className="text-xs font-sans font-bold text-accent">
                    Only {currentStock} packs left—hurry!
                  </p>
                </div>
              )}
            </div>

            {/* Pricing & Variants */}
            <div className="bg-secondary/20 rounded-[3.5rem] p-10 md:p-14 border border-white shadow-inner mb-10">
              <div className="flex items-baseline gap-4 mb-8 text-center md:text-left">
                <span className="text-6xl font-black text-primary-dark tracking-tighter">
                  ₹{price}
                </span>
                <span className="text-gray-400 font-bold line-through text-2xl">
                  ₹{Math.round(price * 1.2)}
                </span>
                <span className="bg-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Save 20%
                </span>
              </div>

              {/* Weight Selection */}
              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark/60">
                  Select Weight / Unit:
                </p>
                <div className="flex flex-wrap gap-3">
                  {(product.variants?.length > 0
                    ? product.variants
                    : [{ uom: product.uom || "pcs", price: product.price }]
                  ).map((v: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedVariant(v);
                        setPrice(v.price);
                      }}
                      className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                        selectedVariant?.uom === v.uom
                          ? "bg-primary border-primary text-white shadow-xl scale-105"
                          : "bg-white border-transparent text-gray-500 hover:border-primary/20"
                      }`}
                    >
                      {v.uom}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-8 bg-white/50 backdrop-blur-md px-10 py-6 rounded-3xl border border-white shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="text-gray-400 hover:text-primary transition-colors p-1"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-2xl font-black w-8 text-center text-primary-dark">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty(
                        manageInventory
                          ? Math.min(currentStock, qty + 1)
                          : qty + 1,
                      )
                    }
                    className="text-gray-400 hover:text-primary transition-colors p-1"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <button
                  onClick={() =>
                    !isOutOfStock &&
                    addToCart(
                      { ...product, price: price, uom: currentUom },
                      qty,
                    )
                  }
                  disabled={isOutOfStock}
                  className={`flex-grow px-10 py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group ${isOutOfStock ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary-dark"}`}
                >
                  <ShoppingCart
                    size={18}
                    className="group-hover:-translate-y-1 transition-transform"
                  />{" "}
                  {isOutOfStock ? "Sold Out" : "Add to Basket"}
                </button>
              </div>
              <button
                onClick={() => !isOutOfStock && handleBuyNow()}
                disabled={isOutOfStock}
                className={`w-full mt-4 py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${isOutOfStock ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-primary-dark text-white hover:bg-black"}`}
              >
                <Zap size={18} fill={isOutOfStock ? "gray" : "white"} />{" "}
                {isOutOfStock ? "Out of Stock" : "Buy It Now"}
              </button>
            </div>

            {/* Delivery Checker */}
            <div className="space-y-6 mb-12">
              <div className="p-8 rounded-[2.5rem] bg-secondary/5 border border-gray-100 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <MapPin size={22} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      Check Delivery
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Pincode (e.g. 600001)"
                        className="bg-transparent border-b-2 border-primary/20 outline-none font-bold text-sm flex-grow pb-1 placeholder:text-gray-300"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                      <button
                        onClick={handlePincodeCheck}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-dark"
                      >
                        {pincodeStatus === "checking" ? "Checking..." : "Check"}
                      </button>
                    </div>
                  </div>
                </div>
                <AnimatePresence>
                  {pincodeStatus === "valid" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 text-primary-dark bg-secondary/10 p-4 rounded-2xl"
                    >
                      <Clock size={18} />
                      <p className="text-xs font-sans font-bold">
                        Standard Delivery:{" "}
                        <span className="font-black">TODAY before 7 PM</span>
                      </p>
                    </motion.div>
                  )}
                  {pincodeStatus === "invalid" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 text-accent bg-accent/5 p-4 rounded-2xl"
                    >
                      <ShieldAlert size={18} />
                      <p className="text-xs font-sans font-bold">
                        Currently not delivering to this area.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Static Trust Icons */}
            <div className="grid grid-cols-2 gap-y-6 pt-10 border-t border-gray-100">
              {[
                { icon: Leaf, label: "100% Organic Ingredients" },
                { icon: ChefHat, label: "Artisanal Handmade Bakes" },
                { icon: Truck, label: "Eco-Friendly Packaging" },
                { icon: ShieldAlert, label: "Preservative-Free Always" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon size={16} className="text-primary-light" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary-dark">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rich Product Content Sections */}
        <div className="mt-40 space-y-40">
          {/* Why you'll love this */}
          <section className="bg-primary rounded-[4rem] p-12 md:p-32 text-center md:text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 relative z-10 items-center">
              <div className="lg:col-span-7">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary mb-6 block">
                  Product Masterclass
                </span>
                <h2 className="text-4xl md:text-7xl font-serif font-black text-white tracking-tighter mb-10 leading-[1.05]">
                  Why this will <br />{" "}
                  <span className="text-secondary italic">
                    change your morning.
                  </span>
                </h2>
                <div className="space-y-8 text-white/70 text-lg leading-relaxed font-medium">
                  <p>
                    {product.description ||
                      "Our artisanal bakes are more than just food; they're a celebration of heritage and health. Every ingredient is scrutinized to ensure it meets our strict organic standards."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <h4 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Info size={14} className="text-secondary" /> Organic
                        Goodness
                      </h4>
                      <p className="text-sm opacity-80">
                        Sourced from certified local farmers who use heirloom
                        seeds and traditional farming methods.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Clock size={14} className="text-secondary" /> Shelf
                        Life
                      </h4>
                      <p className="text-sm opacity-80">
                        Fresh for up to 7 days. For maximum crunch, store in an
                        airtight container away from sunlight.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 hidden lg:block">
                <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden border-8 border-white/10 shadow-2xl relative">
                  <img
                    src={
                      product.images?.[0] ||
                      "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1000"
                    }
                    className="w-full h-full object-cover"
                    alt="Detail View"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                </div>
              </div>
            </div>
          </section>

          {/* Trust Badges Full Grid */}
          <TrustBadges />

          {/* Related Products */}
          <RelatedProducts currentId={product._id} />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl p-4 z-[60] border-t border-gray-100 flex gap-4">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          disabled={isOutOfStock}
          className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center text-primary-dark disabled:opacity-50"
        >
          <Minus size={20} />
        </button>
        <button
          onClick={() =>
            !isOutOfStock &&
            addToCart({ ...product, price: price, uom: currentUom }, qty)
          }
          disabled={isOutOfStock}
          className={`flex-grow font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all ${isOutOfStock ? "bg-gray-200 text-gray-400" : "bg-primary text-white"}`}
        >
          {isOutOfStock ? "Out of Stock" : `Add to Basket • ₹${price * qty}`}
        </button>
      </div>

      <Footer />
    </main>
  );
}
