"use client";

import React, { useEffect, useState, useRef } from "react";
import { Star, Loader2, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface GoogleReview {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userPhoto?: string;
  createdAt: string;
  source: string;
}

interface GoogleReviewsData {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviewCount: number;
  cached?: boolean;
  error?: string;
}

export default function GoogleReviewsCarousel() {
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews/google");
        const reviewData = await res.json();
        setData(reviewData);
      } catch (err) {
        console.error("Failed to fetch Google reviews:", err);
        setData({
          reviews: [],
          averageRating: 0,
          totalReviewCount: 0,
          error: "Failed to load reviews",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!data?.reviews?.length) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % data.reviews.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % (data?.reviews?.length || 1));
    }, 5000);
  };

  const goNext = () => {
    if (!data?.reviews) return;
    goTo((activeIndex + 1) % data.reviews.length);
  };

  const goPrev = () => {
    if (!data?.reviews) return;
    goTo((activeIndex - 1 + data.reviews.length) % data.reviews.length);
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#234d1b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-[#f8bf51] animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (data?.error || !data?.reviews || data.reviews.length === 0) {
    return null;
  }

  const allReviews = data.reviews;
  const visibleCount = Math.min(3, allReviews.length);

  // Get the 3 reviews to show at any given time
  const getVisibleReviews = () => {
    const reviews = [];
    for (let i = 0; i < visibleCount; i++) {
      const idx = (activeIndex + i) % allReviews.length;
      reviews.push({ review: allReviews[idx], index: idx });
    }
    return reviews;
  };

  return (
    <section className="py-28 bg-[#234d1b] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#f8bf51]/[0.04] rounded-full blur-[150px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* Large decorative quote mark */}
      <div className="absolute top-20 left-10 lg:left-20 opacity-[0.04] pointer-events-none">
        <Quote size={200} className="text-[#f8bf51]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Google Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/10">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-white/80 font-semibold text-sm">
                Google Reviews
              </span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-black text-white tracking-tight mb-4">
            Loved by <span className="text-[#f8bf51] italic">Thousands</span>
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
            Real experiences from people who love our authentic homemade
            products
          </p>

          {/* Rating Summary */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 px-8 py-5 rounded-2xl">
              <div className="text-center">
                <div className="text-4xl font-serif font-black text-[#f8bf51] mb-1">
                  {data.averageRating.toFixed(1)}
                </div>
                <div className="flex gap-0.5 mb-1.5 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.round(data.averageRating)
                          ? "text-[#f8bf51] fill-[#f8bf51]"
                          : "text-white/20"
                      }
                    />
                  ))}
                </div>
                <p className="text-white/40 text-xs font-medium">
                  {data.totalReviewCount} verified reviews
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Cards */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {getVisibleReviews().map(({ review, index: idx }, cardIndex) => (
              <motion.div
                key={`${idx}-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: cardIndex * 0.1, duration: 0.5 }}
                className="bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-3xl p-7 relative group hover:bg-white/[0.12] transition-all duration-500"
              >
                {/* Google icon */}
                <button
                  onClick={() =>
                    window.open(
                      "https://www.google.com/search?q=sai+nandhini+tasty+world+madurai+reviews",
                      "_blank",
                    )
                  }
                  className="absolute top-5 right-5 opacity-40 hover:opacity-80 transition-opacity"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </button>

                {/* Quote icon */}
                <div className="mb-5">
                  <Quote size={28} className="text-[#f8bf51]/30" />
                </div>

                {/* Rating Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "text-[#f8bf51] fill-[#f8bf51]"
                          : "text-white/20"
                      }
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-4">
                  {review.comment || "Great experience! Amazing products."}
                </p>

                {/* User info */}
                <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                  {review.userPhoto ? (
                    <Image
                      src={review.userPhoto}
                      alt={review.userName}
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-[#f8bf51]/20"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#f8bf51]/20 flex items-center justify-center ring-2 ring-[#f8bf51]/10">
                      <span className="text-[#f8bf51] font-bold text-sm">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-sm text-white block">
                      {review.userName}
                    </span>
                    <span className="text-xs text-white/30">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation controls */}
          {allReviews.length > 3 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={goPrev}
                className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {allReviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? "w-6 bg-[#f8bf51]"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                className="w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* View All on Google CTA */}
        <div className="text-center mt-12">
          <a
            href="https://www.google.com/search?q=sai+nandhini+tasty+world+madurai+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white px-7 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 backdrop-blur-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            View All {data.totalReviewCount} Reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
}
