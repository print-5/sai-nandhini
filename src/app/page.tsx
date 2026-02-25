import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import TrustSection from "@/components/TrustSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyChooseUs from "@/components/WhyChooseUs";
import AboutUs from "@/components/AboutUs";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CorporateEnquiry from "@/components/CorporateEnquiry";
import GoogleReviewsCarousel from "@/components/GoogleReviewsCarousel";
import { getHeroSlides, getCategories, getProducts } from "@/lib/data";

export const metadata = {
  title: "Sai Nandhini | Authentic Homemade Sweets & Snacks",
  description:
    "Experience the tradition of handcrafted sweets and snacks from Sai Nandhini. Made with love and the finest ingredients.",
};

export default async function Home() {
  const [heroSlides, categories, products] = await Promise.all([
    getHeroSlides(),
    getCategories(),
    getProducts(),
  ]);

  return (
    <main className="min-h-screen bg-[#ece0cc]">
      <Navbar />

      {/* Hero Carousel */}
      <HeroCarousel initialSlides={heroSlides} />

      {/* Trust Badges — Cream */}
      <TrustSection />

      {/* Top Categories — Cream */}
      <CategorySection initialCategories={categories} />

      {/* Best Sellers — White */}
      <FeaturedProducts initialProducts={products.slice(0, 8)} />

      {/* Why Choose Us — Dark Green */}
      <WhyChooseUs />

      {/* About Us — Cream */}
      <AboutUs />

      {/* Google Reviews — Dark Green */}
      <GoogleReviewsCarousel />

      {/* Corporate Enquiry — White */}
      <CorporateEnquiry />

      {/* CTA Section — Dark Green */}
      <CTASection />

      <Footer />
    </main>
  );
}
