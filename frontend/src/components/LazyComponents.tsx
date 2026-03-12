"use client";

import { lazy, Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";

// Lazy load heavy components
export const LazyGoogleReviewsCarousel = lazy(() => import("./GoogleReviewsCarousel"));
export const LazyCartDrawer = lazy(() => import("./CartDrawer"));
export const LazyCorporateEnquiry = lazy(() => import("./CorporateEnquiry"));
export const LazyAnalyticsClient = lazy(() => import("../app/admin/analytics/AnalyticsClient"));

// Wrapper components with loading states
export function GoogleReviewsCarouselLazy() {
  return (
    <Suspense fallback={<LoadingSpinner section="general" />}>
      <LazyGoogleReviewsCarousel />
    </Suspense>
  );
}

export function CartDrawerLazy({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <Suspense fallback={null}>
      <LazyCartDrawer isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
}

export function CorporateEnquiryLazy() {
  return (
    <Suspense fallback={<LoadingSpinner section="general" />}>
      <LazyCorporateEnquiry />
    </Suspense>
  );
}

export function AnalyticsClientLazy({ initialData }: { initialData: any }) {
  return (
    <Suspense fallback={<LoadingSpinner section="dashboard" />}>
      <LazyAnalyticsClient initialData={initialData} />
    </Suspense>
  );
}