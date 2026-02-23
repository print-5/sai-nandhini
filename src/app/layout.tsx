import type { Metadata } from "next";
import { Poppins, Baloo_2 } from "next/font/google";
import "./globals.css";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import WhatsAppButton from "@/components/WhatsAppButton";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const baloo = Baloo_2({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-baloo",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const settings = await Settings.findOne().select("seo favicon");
    if (settings?.seo) {
      return {
        title: settings.seo.metaTitle || "Sai Nandhini Tasty World",
        description:
          settings.seo.metaDescription || "Authentic South Indian Delicacies",
        keywords: settings.seo.keywords
          ? settings.seo.keywords.split(",").map((k: string) => k.trim())
          : "sweets, snacks, pickles",
        openGraph: {
          title: settings.seo.metaTitle,
          description: settings.seo.metaDescription,
          images: settings.seo.ogImage ? [settings.seo.ogImage] : [],
        },
        icons: settings.favicon ? { icon: settings.favicon } : undefined,
      };
    }
  } catch (e) {
    console.error("SEO Fetch Error:", e);
  }

  return {
    title: "Sai Nandhini Tasty World | Authentic South Indian Delicacies",
    description:
      "Experience the magic of artisanal bread, celebratory cakes, and traditional sweets crafted with love and the finest ingredients.",
    keywords:
      "sweets, snacks, pickles, cakes, south indian food, authentic delicacies",
  };
}

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${baloo.variable} font-sans antialiased text-gray-900 bg-secondary`}
      >
        <Providers>
          {children}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
