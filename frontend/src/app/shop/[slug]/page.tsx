import { Metadata } from "next";
import ProductClient from "./ProductClient";

import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// Helper to fetch product (can act as a primitive cache if moved to a cached function)
async function getProduct(slug: string) {
  await connectDB();
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
  const query = isObjectId ? { _id: slug } : { slug: slug };
  return Product.findOne(query).lean();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Sai Nandhini Tasty World",
    };
  }

  const title = product.seo?.metaTitle || product.name || "Product Details";
  const description =
    product.seo?.metaDescription ||
    product.description?.substring(0, 160) ||
    "Authentic South Indian Delicacies";
  const keywords = product.seo?.keywords
    ? product.seo.keywords.split(",").map((k: string) => k.trim())
    : [];
  const images = product.images || [];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productDoc = await getProduct(slug);

  // Convert to serializable JSON to pass to Client Component
  const product = productDoc ? JSON.parse(JSON.stringify(productDoc)) : null;

  return <ProductClient product={product} />;
}
