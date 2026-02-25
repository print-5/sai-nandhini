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
  const defaultMeta = {
    title: "Sai Nandhini Tasty World | Authentic South Indian Delicacies",
    description:
      "Experience the magic of traditional sweets and savories crafted with love and the finest ingredients.",
    keywords:
      "sweets, snacks, pickles, south indian food, authentic delicacies",
  };

  try {
    await connectDB();
    const settings = await Settings.findOne().select("seo favicon shopName");

    if (settings) {
      const siteName = settings.shopName || "Sai Nandhini Tasty World";
      return {
        title: settings.seo?.metaTitle || siteName,
        description: settings.seo?.metaDescription || defaultMeta.description,
        keywords: settings.seo?.keywords
          ? settings.seo.keywords.split(",").map((k: string) => k.trim())
          : defaultMeta.keywords.split(","),
        openGraph: {
          title: settings.seo?.metaTitle || siteName,
          description: settings.seo?.metaDescription || defaultMeta.description,
          images: settings.seo?.ogImage ? [settings.seo.ogImage] : [],
          siteName: siteName,
        },
        icons: settings.favicon ? { icon: settings.favicon } : undefined,
      };
    }
  } catch (e) {
    console.error("SEO Fetch Error:", e);
  }

  return defaultMeta;
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
