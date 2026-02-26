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
  ShieldAlert,
  ChevronDown,
  Info,
  Share2,
  Package,
  Award,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

interface ReviewData {
  _id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ProductClient({
  product: initialProduct,
}: {
  product: any;
}) {
  const [product] = useState<any>(initialProduct);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [price, setPrice] = useState(0);
  const [manageInventory, setManageInventory] = useState(true);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Review submission state
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

      // Fetch reviews
      const fetchReviews = async () => {
        try {
          setReviewsLoading(true);
          const res = await fetch(`/api/products/${product._id}/reviews`);
          if (res.ok) {
            const data = await res.json();
            setReviews(data.reviews || []);
            setReviewStats(
              data.stats || {
                averageRating: 0,
                totalReviews: 0,
                ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
              },
            );
            setCanReview(data.canReview || false);
          }
        } catch (err) {
          console.error("Failed to fetch reviews", err);
        } finally {
          setReviewsLoading(false);
        }
      };
      fetchReviews();
    }
  }, [product]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to submit a review");
      return;
    }
    if (newReviewRating < 1 || newReviewRating > 5) {
      toast.error("Please select a valid rating");
      return;
    }
    if (!newReviewComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/products/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: newReviewRating,
          comment: newReviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Review submitted! Approval pending.");
        setIsReviewFormOpen(false);
        setNewReviewComment("");
        setNewReviewRating(5);
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBuyNow = () => {
    addToCart({ ...product, price: price, uom: currentUom }, qty);
    router.push("/checkout");
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
    <main className="min-h-screen bg-gradient-to-b from-white to-secondary/30 selection:bg-primary selection:text-white">
      <Navbar />

      <div className="pt-44 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mb-8 uppercase tracking-wider">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Product Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Right: Product Info Stack */}
          <div className="flex flex-col space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-3">
                {product.badge && (
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-wide inline-flex items-center gap-1.5">
                    <Award size={12} />
                    {product.badge}
                  </span>
                )}
                <span className="bg-accent/10 text-accent text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-wide inline-flex items-center gap-1.5">
                  <Clock size={12} />
                  Fresh Today
                </span>
                {!isOutOfStock && (
                  <span className="bg-green-50 text-green-600 text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-wide inline-flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    In Stock
                  </span>
                )}
              </div>

              {/* Title & Share */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-dark leading-tight">
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
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="p-3 bg-gray-100 hover:bg-primary hover:text-white rounded-xl text-gray-600 transition-all duration-300 flex-shrink-0"
                  title="Share this product"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* Rating & Reviews */}
              {reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={
                            i < Math.round(reviewStats.averageRating)
                              ? "currentColor"
                              : "none"
                          }
                          strokeWidth={2}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-primary-dark">
                      {reviewStats.averageRating}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const reviewSection =
                        document.getElementById("reviews-section");
                      reviewSection?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="text-xs font-medium text-gray-500 hover:text-primary cursor-pointer transition-colors"
                  >
                    ({reviewStats.totalReviews}{" "}
                    {reviewStats.totalReviews === 1 ? "Review" : "Reviews"})
                  </button>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary-dark">
                  ₹{price}
                </span>
                {product.badge && (
                  <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">Inclusive of all taxes</p>
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-primary-dark uppercase tracking-wide">
                  Select Size / Weight:
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedVariant(v);
                        setPrice(v.price);
                      }}
                      className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide border-2 transition-all duration-200 ${
                        selectedVariant?.uom === v.uom
                          ? "bg-primary border-primary text-white shadow-md"
                          : "bg-white border-gray-200 text-gray-700 hover:border-primary/50"
                      }`}
                    >
                      {v.uom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-primary-dark uppercase tracking-wide">
                Quantity:
              </label>
              <div className="flex gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4 bg-white border-2 border-gray-200 px-6 py-3 rounded-xl">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    <Minus size={18} strokeWidth={2.5} />
                  </button>
                  <span className="text-xl font-bold w-8 text-center text-primary-dark">
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
                    className="text-gray-500 hover:text-primary transition-colors"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    if (!isOutOfStock) {
                      addToCart(
                        { ...product, price: price, uom: currentUom },
                        qty,
                      );
                      toast.success(`${qty} item(s) added to cart!`);
                    }
                  }}
                  disabled={isOutOfStock}
                  className={`flex-grow px-8 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl"
                  }`}
                >
                  <ShoppingCart size={18} />
                  {isOutOfStock ? "Sold Out" : "Add to Cart"}
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={() => !isOutOfStock && handleBuyNow()}
                disabled={isOutOfStock}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-hover shadow-md hover:shadow-lg"
                }`}
              >
                <Zap size={18} fill={isOutOfStock ? "gray" : "white"} />
                {isOutOfStock ? "Out of Stock" : "Buy It Now"}
              </button>
            </div>

            {/* Stock & Social Proof */}
            {!isOutOfStock && (
              <div className="space-y-3">
                {manageInventory && currentStock < 10 && currentStock > 0 && (
                  <div className="bg-orange-50 border border-orange-200 flex items-center gap-3 px-4 py-3 rounded-xl">
                    <ShieldAlert
                      size={18}
                      className="text-orange-600 flex-shrink-0"
                    />
                    <p className="text-sm font-medium text-orange-800">
                      Only {currentStock} left in stock - Order soon!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Product Features Grid */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Leaf,
                    label: "100% Organic",
                    sublabel: "Certified ingredients",
                  },
                  {
                    icon: ChefHat,
                    label: "Handmade",
                    sublabel: "Crafted with care",
                  },
                  {
                    icon: Truck,
                    label: "Free Delivery",
                    sublabel: "On orders above ₹500",
                  },
                  {
                    icon: Award,
                    label: "Premium Quality",
                    sublabel: "Best in class",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                      <item.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">{item.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Details */}
        <div className="mt-20 space-y-16">
          {/* Description Section */}
          <section className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-sm">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Info size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-primary-dark">
                  About This Product
                </h2>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">
                  {product.description ||
                    "Our artisanal bakes are more than just food; they're a celebration of heritage and health. Every ingredient is scrutinized to ensure it meets our strict organic standards. Handcrafted with love and baked fresh daily to bring you the authentic taste of traditional recipes."}
                </p>
              </div>

              {/* Key Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-green-50 p-2 rounded-lg flex-shrink-0">
                    <Leaf size={18} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary-dark mb-1">
                      100% Organic
                    </h4>
                    <p className="text-xs text-gray-600">
                      Sourced from certified local farmers using traditional
                      methods
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                    <Clock size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary-dark mb-1">
                      Fresh Daily
                    </h4>
                    <p className="text-xs text-gray-600">
                      Baked fresh every morning, delivered the same day
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-50 p-2 rounded-lg flex-shrink-0">
                    <Package size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary-dark mb-1">
                      Eco Packaging
                    </h4>
                    <p className="text-xs text-gray-600">
                      Sustainable, biodegradable packaging materials
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-50 p-2 rounded-lg flex-shrink-0">
                    <Award size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary-dark mb-1">
                      Premium Quality
                    </h4>
                    <p className="text-xs text-gray-600">
                      No preservatives, artificial colors, or flavors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Reviews Section */}
          <section
            id="reviews-section"
            className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <Star size={20} className="text-accent" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-primary-dark">
                  Customer Reviews
                </h2>
              </div>
              {canReview && (
                <button
                  onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-primary-dark transition-colors"
                >
                  {isReviewFormOpen ? "Close Form" : "Write a Review"}
                </button>
              )}
              {!canReview && session && (
                <p className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                  Reviews allowed after delivery
                </p>
              )}
            </div>

            <AnimatePresence>
              {isReviewFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <form
                    onSubmit={handleSubmitReview}
                    className="bg-gray-50 p-6 rounded-xl border border-gray-200"
                  >
                    <h3 className="font-bold text-primary-dark mb-4">
                      Submit Your Review
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                          Rating
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setNewReviewRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                size={28}
                                fill={
                                  star <= newReviewRating ? "#f8bf51" : "none"
                                }
                                className={
                                  star <= newReviewRating
                                    ? "text-accent"
                                    : "text-gray-300"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                          Your Review
                        </label>
                        <textarea
                          required
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          placeholder="What did you like or dislike?"
                          rows={4}
                          className="w-full bg-white border border-gray-300 focus:border-primary rounded-xl px-4 py-3 outline-none transition-colors"
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsReviewFormOpen(false)}
                          className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                          {isSubmittingReview
                            ? "Submitting..."
                            : "Submit Review"}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {reviewStats.totalReviews > 0 && (
                  <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-200">
                    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 md:w-64">
                      <div className="text-5xl font-bold text-primary-dark mb-2">
                        {reviewStats.averageRating}
                      </div>
                      <div className="flex gap-1 text-accent mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            fill={
                              i < Math.round(reviewStats.averageRating)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Based on {reviewStats.totalReviews}{" "}
                        {reviewStats.totalReviews === 1 ? "review" : "reviews"}
                      </p>
                    </div>

                    <div className="flex-grow space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count =
                          reviewStats.ratingBreakdown[
                            stars as keyof typeof reviewStats.ratingBreakdown
                          ];
                        const percentage =
                          reviewStats.totalReviews > 0
                            ? (count / reviewStats.totalReviews) * 100
                            : 0;

                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600 w-12">
                              {stars} star
                            </span>
                            <div className="flex-grow bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-accent h-full rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600 w-12 text-right">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.slice(0, 5).map((review) => {
                      const reviewDate = new Date(review.createdAt);
                      const now = new Date();
                      const diffTime = Math.abs(
                        now.getTime() - reviewDate.getTime(),
                      );
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                      );

                      let timeAgo = "";
                      if (diffDays === 0) timeAgo = "Today";
                      else if (diffDays === 1) timeAgo = "Yesterday";
                      else if (diffDays < 7) timeAgo = `${diffDays} days ago`;
                      else if (diffDays < 30)
                        timeAgo = `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? "week" : "weeks"} ago`;
                      else
                        timeAgo = `${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? "month" : "months"} ago`;

                      return (
                        <div
                          key={review._id}
                          className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-primary-dark">
                                  {review.userName}
                                </span>
                                <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Verified Purchase
                                </span>
                              </div>
                              <div className="flex gap-1 text-accent">
                                {[...Array(5)].map((_, j) => (
                                  <Star
                                    key={j}
                                    size={14}
                                    fill={
                                      j < review.rating
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {timeAgo}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                      <MessageSquare
                        size={40}
                        className="text-gray-300 mx-auto mb-3"
                      />
                      <h4 className="font-bold text-primary-dark">
                        No reviews yet
                      </h4>
                      <p className="text-gray-500 text-sm mt-1">
                        Be the first to review this product!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Trust Badges */}
          <TrustBadges />

          {/* Related Products */}
          <RelatedProducts currentId={product._id} />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl p-4 z-[60] border-t border-gray-200 shadow-2xl">
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={isOutOfStock}
              className="text-gray-600 disabled:opacity-50"
            >
              <Minus size={18} />
            </button>
            <span className="font-bold text-lg w-6 text-center">{qty}</span>
            <button
              onClick={() =>
                setQty(
                  manageInventory ? Math.min(currentStock, qty + 1) : qty + 1,
                )
              }
              disabled={isOutOfStock}
              className="text-gray-600 disabled:opacity-50"
            >
              <Plus size={18} />
            </button>
          </div>
          <button
            onClick={() => {
              if (!isOutOfStock) {
                addToCart({ ...product, price: price, uom: currentUom }, qty);
                toast.success(`${qty} item(s) added to cart!`);
              }
            }}
            disabled={isOutOfStock}
            className={`flex-grow font-bold uppercase tracking-wide text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 ${
              isOutOfStock
                ? "bg-gray-200 text-gray-400"
                : "bg-primary text-white"
            }`}
          >
            {isOutOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart size={16} />
                Add • ₹{price * qty}
              </>
            )}
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
