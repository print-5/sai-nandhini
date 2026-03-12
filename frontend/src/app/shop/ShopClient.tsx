"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import CategoryFilter from "@/components/CategoryFilter";

interface ShopClientProps {
  initialProducts: any[];
  initialCategories: any[];
}

export default function ShopClient({ initialProducts, initialCategories }: ShopClientProps) {
  const [products] = useState(initialProducts);
  const [categories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-[#ece0cc]">
      <Navbar />
      
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-[#234d1b] mb-4">
              Our Products
            </h1>
            <p className="text-[#234d1b]/60 max-w-2xl mx-auto">
              Discover our complete collection of handcrafted sweets, savory snacks, and authentic delicacies.
            </p>
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          <ProductGrid products={filteredProducts} />
        </div>
      </main>

      <Footer />
    </div>
  );
}