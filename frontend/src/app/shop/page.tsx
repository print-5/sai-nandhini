import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/data";
import ShopClient from "./ShopClient";
import LoadingSpinner from "@/components/LoadingSpinner";

export const metadata = {
  title: "Shop All Products | Sai Nandhini Tasty World",
  description: "Browse our complete collection of authentic sweets, snacks, and delicacies.",
};

// Enable ISR with revalidation
export const revalidate = 1800; // Revalidate every 30 minutes

async function ShopData() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  
  return <ShopClient initialProducts={products} initialCategories={categories} />;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingSpinner section="products" />}>
      <ShopData />
    </Suspense>
  );
}