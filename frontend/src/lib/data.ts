import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Settings from "@/models/Settings";
import HeroSlide from "@/models/HeroSlide";
import { getCachedSettings } from "./settings-cache";

export async function getProducts() {
  await connectDB();
  const products = await Product.find({ isActive: { $ne: false } }).sort({
    createdAt: -1,
  });
  return JSON.parse(JSON.stringify(products));
}

export async function getCategories() {
  await connectDB();
  const categories = await Category.find({ isActive: { $ne: false } }).sort({
    order: 1,
  });
  return JSON.parse(JSON.stringify(categories));
}

export async function getSettings() {
  // Use cached settings instead of direct DB query
  const settings = await getCachedSettings();
  return JSON.parse(JSON.stringify(settings || {}));
}

export async function getHeroSlides() {
  await connectDB();
  const slides = await HeroSlide.find({ isActive: { $ne: false } }).sort({
    order: 1,
  });
  return JSON.parse(JSON.stringify(slides));
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: { $ne: false } });
  return product ? JSON.parse(JSON.stringify(product)) : null;
}
