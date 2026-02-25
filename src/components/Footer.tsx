"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative">
      {/* Main Footer */}
      <div className="bg-[#2F3E2C] pt-20 pb-12 relative overflow-hidden">
        {/* Decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16 border-b border-white/10 pb-16">
            {/* Column 1: Brand Info */}
            <div className="space-y-5">
              <Link href="/">
                {settings?.logo ? (
                  <div className="h-12 w-48 relative mb-4">
                    <Image
                      src={settings.logo}
                      alt={settings.shopName || "Sai Nandhini"}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <h2 className="text-3xl font-serif font-black text-white tracking-wide">
                    {settings?.shopName || "Sai Nandhini"}
                  </h2>
                )}
              </Link>
              <p className="text-[#C6A75E] font-serif italic text-base">
                "Crafting Sweet Memories in Every Bite"
              </p>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Authentic traditional sweets and savories made with pure
                ingredients, tailored for your premium taste.
              </p>

              <div className="space-y-3.5 pt-4">
                {settings?.contactPhone && (
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="flex items-center gap-3 group text-white/60 hover:text-white transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center group-hover:bg-[#C6A75E] group-hover:text-[#2F3E2C] transition-all">
                      <Phone size={15} />
                    </div>
                    <span className="text-sm">{settings.contactPhone}</span>
                  </a>
                )}
                {settings?.contactEmail && (
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="flex items-center gap-3 group text-white/60 hover:text-white transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center group-hover:bg-[#C6A75E] group-hover:text-[#2F3E2C] transition-all">
                      <Mail size={15} />
                    </div>
                    <span className="text-sm">{settings.contactEmail}</span>
                  </a>
                )}
                {settings?.address && (
                  <div className="flex items-center gap-3 text-white/60">
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center">
                      <MapPin size={15} />
                    </div>
                    <span className="text-sm leading-snug">
                      {settings.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Our Policies */}
            <div>
              <h4 className="text-white font-bold text-base mb-6 relative inline-block">
                Our Policies
                <span className="absolute -bottom-1.5 left-0 w-8 h-[2px] bg-[#C6A75E] rounded-full" />
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "Privacy Policy", link: "/privacy-policy" },
                  { name: "Shipping Policy", link: "/shipping-policy" },
                  { name: "Return & Refund", link: "/return-and-refund" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.link}
                      className="text-white/50 hover:text-[#C6A75E] hover:pl-1 transition-all text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Information */}
            <div>
              <h4 className="text-white font-bold text-base mb-6 relative inline-block">
                Information
                <span className="absolute -bottom-1.5 left-0 w-8 h-[2px] bg-[#C6A75E] rounded-full" />
              </h4>
              <ul className="space-y-3">
                {[
                  { name: "Our Outlets", link: "/outlets" },
                  { name: "Track Your Order", link: "/track" },
                  { name: "About Us", link: "/about" },
                  { name: "Contact Us", link: "/contact" },
                  { name: "FAQ's", link: "/faq" },
                  { name: "Combos", link: "/shop?category=Combos" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.link}
                      className="text-white/50 hover:text-[#C6A75E] hover:pl-1 transition-all text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Made For You + Socials */}
            <div>
              <h4 className="text-white font-bold text-base mb-6 relative inline-block">
                Made For You
                <span className="absolute -bottom-1.5 left-0 w-8 h-[2px] bg-[#C6A75E] rounded-full" />
              </h4>
              <ul className="space-y-3 mb-8">
                {[
                  { name: "Customizable Packs", link: "/contact" },
                  { name: "Personalized Branding", link: "/contact" },
                  { name: "Bulk Orders", link: "/contact" },
                  { name: "Corporate Gifting", link: "/contact" },
                  { name: "Event Gifting", link: "/contact" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.link}
                      className="text-white/50 hover:text-[#C6A75E] hover:pl-1 transition-all text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Social Media */}
              <div className="flex gap-3">
                {settings?.socialMedia?.instagram && (
                  <a
                    href={settings.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-white/60 hover:bg-[#C6A75E] hover:text-[#2F3E2C] transition-all"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {settings?.socialMedia?.facebook && (
                  <a
                    href={settings.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-white/60 hover:bg-[#C6A75E] hover:text-[#2F3E2C] transition-all"
                  >
                    <Facebook size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { label: "Order Now", link: "/shop" },
              { label: "Bulk Enquiry", link: "/contact" },
              { label: "Special Offers", link: "/offers" },
            ].map((btn) => (
              <Link
                key={btn.label}
                href={btn.link}
                className="px-7 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all hover:scale-105 active:scale-95 border border-[#C6A75E]/30 text-[#C6A75E] hover:bg-[#C6A75E] hover:text-[#2F3E2C]"
              >
                {btn.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center border-t border-white/10 pt-8">
            <p className="text-white/30 text-xs font-medium uppercase tracking-widest">
              © {new Date().getFullYear()} Sai Nandhini Tasty World. All Rights
              Reserved.
            </p>
            <div className="flex gap-6 text-white/30 text-xs font-bold uppercase tracking-widest">
              <Link
                href="/terms"
                className="hover:text-[#C6A75E] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="hover:text-[#C6A75E] transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll To Top */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <button
          onClick={scrollToTop}
          className="w-11 h-11 bg-[#C6A75E] text-[#2F3E2C] rounded-xl flex items-center justify-center shadow-xl hover:bg-white transition-all"
        >
          <ArrowUp size={20} />
        </button>
      </div>
    </footer>
  );
}
