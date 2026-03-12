"use client";

import { useEffect } from "react";

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log("🚀 Navigation Performance:", {
            "DNS Lookup": navEntry.domainLookupEnd - navEntry.domainLookupStart,
            "TCP Connection": navEntry.connectEnd - navEntry.connectStart,
            "Server Response": navEntry.responseEnd - navEntry.requestStart,
            "DOM Content Loaded": navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
            "Page Load Complete": navEntry.loadEventEnd - navEntry.navigationStart,
          });
        }

        if (entry.entryType === "largest-contentful-paint") {
          console.log("🎯 LCP (Largest Contentful Paint):", entry.startTime, "ms");
        }

        if (entry.entryType === "first-input") {
          console.log("⚡ FID (First Input Delay):", entry.processingStart - entry.startTime, "ms");
        }

        if (entry.entryType === "layout-shift") {
          console.log("📐 CLS (Cumulative Layout Shift):", entry.value);
        }
      });
    });

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ["navigation", "largest-contentful-paint", "first-input", "layout-shift"] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      observer.observe({ entryTypes: ["navigation"] });
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) { // Log slow resources (>1s)
          console.warn("🐌 Slow Resource:", entry.name, entry.duration, "ms");
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ["resource"] });
    } catch (e) {
      // Ignore if not supported
    }

    return () => {
      observer.disconnect();
      resourceObserver.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}