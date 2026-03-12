"use client";

import { motion } from "framer-motion";

interface CategoryFilterProps {
  categories: any[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mb-12">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onCategoryChange(null)}
          className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
            selectedCategory === null
              ? "bg-[#234d1b] text-white shadow-lg"
              : "bg-white text-[#234d1b] border border-[#234d1b]/20 hover:bg-[#234d1b]/5"
          }`}
        >
          All Products
        </motion.button>
        
        {categories.map((category, index) => (
          <motion.button
            key={category._id || category.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategoryChange(category.name)}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
              selectedCategory === category.name
                ? "bg-[#234d1b] text-white shadow-lg"
                : "bg-white text-[#234d1b] border border-[#234d1b]/20 hover:bg-[#234d1b]/5"
            }`}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}