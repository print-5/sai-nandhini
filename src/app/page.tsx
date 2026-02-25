import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import TrustSection from "@/components/TrustSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyChooseUs from "@/components/WhyChooseUs";
import AboutUs from "@/components/AboutUs";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import CorporateEnquiry from "@/components/CorporateEnquiry";
import { Star } from "lucide-react";
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
    <main className="min-h-screen bg-[#F8F6F2]">
      <Navbar />

      {/* Hero Carousel */}
      <HeroCarousel initialSlides={heroSlides} />

      {/* Trust Badges */}
      <TrustSection />

      {/* Top Categories */}
      <CategorySection initialCategories={categories} />

      {/* Best Sellers */}
      <FeaturedProducts initialProducts={products.slice(0, 8)} />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Customer Reviews Section */}
      <section className="py-28 bg-[#F8F6F2] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C6A75E] mb-3 block">
              Kind Words
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-[#2F3E2C] tracking-tight">
              Loved by{" "}
              <span className="text-[#C6A75E] italic">5,000+ Regulars</span>
            </h2>
            <div className="flex justify-center gap-1 mt-4 text-[#C6A75E]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2">
              Combined 4.8 Store Rating
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Jenkins",
                role: "Weekly Guest",
                text: "The artisanal sourdough here is world-class! It's our weekly ritual to grab a loaf and some of their traditional sweets. Best bakery in town hands down!",
              },
              {
                name: "Arjun Sharma",
                role: "Wedding Planner",
                text: "Ordered my wedding cake from Sai Nandhini. Not only was it stunning to look at, but the taste was incredible. Everyone asked where we got it!",
              },
              {
                name: "Priya Patel",
                role: "Home Maker",
                text: "Their mixture and savory snacks are just like the ones my grandmother used to make. Pure, authentic, and perfectly spiced. Pure magic!",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-[#2F3E2C]/3 hover:-translate-y-2 transition-all border border-gray-100 relative group"
              >
                <span className="absolute top-6 right-8 text-7xl text-[#C6A75E]/15 pointer-events-none group-hover:scale-110 transition-transform font-serif">
                  "
                </span>
                <div className="flex gap-1 mb-4 text-[#C6A75E]">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600 font-medium mb-8 leading-relaxed text-[15px] relative z-10">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2F3E2C]/10 flex items-center justify-center font-serif font-black text-[#2F3E2C] text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2F3E2C] text-sm">
                      {t.name}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <AboutUs />

      {/* Corporate Enquiry */}
      <CorporateEnquiry />

      {/* Newsletter */}
      <Newsletter />

      <Footer />
    </main>
  );
}
