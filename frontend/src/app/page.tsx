import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import TrustSection from "@/components/TrustSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyChooseUs from "@/components/WhyChooseUs";
import AboutUs from "@/components/AboutUs";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { GoogleReviewsCarouselLazy, CorporateEnquiryLazy } from "@/components/LazyComponents";
import { getHeroSlides, getCategories, getProducts } from "@/lib/data";
import LoadingSpinner from "@/components/LoadingSpinner";

export const metadata = {
  title: "Sai Nandhini | Authentic Homemade Sweets & Snacks",
  description:
    "Experience the tradition of handcrafted sweets and snacks from Sai Nandhini. Made with love and the finest ingredients.",
};

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour

// Server Components for data fetching with ISR
async function HeroSection() {
  const heroSlides = await getHeroSlides();
  return <HeroCarousel initialSlides={heroSlides} />;
}

async function CategoriesSection() {
  const categories = await getCategories();
  return <CategorySection initialCategories={categories} />;
}

async function ProductsSection() {
  const products = await getProducts();
  return <FeaturedProducts initialProducts={products.slice(0, 8)} />;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#ece0cc]">
      <Navbar />

      {/* Hero Carousel with Suspense */}
      <Suspense fallback={<LoadingSpinner section="hero" />}>
        <HeroSection />
      </Suspense>

      {/* Trust Badges — Cream */}
      <TrustSection />

      {/* Top Categories — Cream */}
      <Suspense fallback={<LoadingSpinner section="categories" />}>
        <CategoriesSection />
      </Suspense>

      {/* Best Sellers — White */}
      <Suspense fallback={<LoadingSpinner section="products" />}>
        <ProductsSection />
      </Suspense>

      {/* Why Choose Us — Dark Green */}
      <WhyChooseUs />

      {/* About Us — Cream */}
      <AboutUs />

      {/* Google Reviews — Dark Green */}
      <GoogleReviewsCarouselLazy />

      {/* Corporate Enquiry — White */}
      <CorporateEnquiryLazy />

      {/* CTA Section — Dark Green */}
      <CTASection />

      <Footer />
    </main>
  );
}
