"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Package,
  LayoutGrid,
  Loader2,
  Scale,
  ClipboardList,
  Ticket,
  FileText,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Star,
  Truck,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!isPending && pathname !== "/admin/login") {
      if (!session || (session.user as any)?.role !== "admin") {
        router.replace("/admin/login");
      }
    }
  }, [session, isPending, pathname, router]);

  if (isPending) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#234d1b]">
        <Loader2 className="animate-spin text-[#f8bf51] mb-4" size={48} />
        <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">
          Verifying credentials...
        </p>
      </div>
    );
  }

  // Don't show layout on the login page itself
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // If unauthenticated/unauthorized, we return null while the redirect happens
  // (or specific content if you prefer, but null avoids flashes)
  if (!isPending && (!session || (session.user as any)?.role !== "admin")) {
    return null;
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/products", label: "Product Master", icon: Package },
    { href: "/admin/inventory", label: "Inventory", icon: ClipboardList },
    { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
    { href: "/admin/uom", label: "UOM Master", icon: Scale },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/reviews", label: "Product Reviews", icon: Star },
    { href: "/admin/coupons", label: "Promo Codes", icon: Ticket },

    { href: "/admin/customers", label: "Customer Base", icon: Users },
    // { href: "/admin/analytics", label: "Business Insights", icon: BarChart3 },
    { href: "/admin/enquiries", label: "Event Enquiries", icon: ClipboardList },
    { href: "/admin/legal", label: "Legal Pages", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#ece0cc] font-sans overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#234d1b",
            color: "#fff",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: "600",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#f8bf51",
              secondary: "#fff",
            },
          },
        }}
      />
      {/* Premium Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 300 }}
        className="bg-[#234d1b] text-white flex flex-col shadow-2xl z-20 relative transition-all duration-300 ease-in-out"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-[#f8bf51] text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform z-30 ring-2 ring-[#ece0cc]"
        >
          {isCollapsed ? (
            <ChevronRight size={14} strokeWidth={3} />
          ) : (
            <ChevronLeft size={14} strokeWidth={3} />
          )}
        </button>

        <div
          className={`flex items-center gap-4 mb-8 p-6 ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg shrink-0 relative">
            {settings?.logo ? (
              <Image
                src={settings.logo}
                className="w-full h-full object-contain p-1"
                alt="Logo"
                fill
                sizes="40px"
              />
            ) : (
              <span className="text-[#234d1b] font-black italic">SN</span>
            )}
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap overflow-hidden"
            >
              <h1 className="text-lg font-serif font-black tracking-tight leading-none uppercase text-[#ece0cc]">
                {settings?.shopName || "Sai Nandhini"}
              </h1>
              <p className="text-[9px] text-[#f8bf51] uppercase font-black tracking-[0.2em] mt-1">
                Admin Portal
              </p>
            </motion.div>
          )}
        </div>

        <nav className="flex-grow space-y-1.5 px-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative ${
                  isActive
                    ? "bg-[#ece0cc] text-[#234d1b] shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`shrink-0 transition-transform ${isActive ? "text-[#234d1b]" : "group-hover:scale-110"}`}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-[11px] font-black uppercase tracking-wider whitespace-nowrap ${isActive ? "" : "opacity-80"}`}
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f8bf51]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2 mt-2">
          {/* <Link
            href="/admin/database"
            className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all ${
              pathname === "/admin/database"
                ? "bg-white/10 text-white"
                : "hover:bg-white/5 text-white/60 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
            title="Database Management"
          >
            <Database size={20} />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                Database
              </span>
            )}
          </Link> */}
          <Link
            href="/admin/hero-slides"
            className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all ${
              pathname === "/admin/hero-slides"
                ? "bg-white/10 text-white"
                : "hover:bg-white/5 text-white/60 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
            title="Hero Carousel"
          >
            <ImageIcon size={20} />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                Hero Carousel
              </span>
            )}
          </Link>
          <Link
            href="/admin/shipping"
            className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all ${
              pathname === "/admin/shipping"
                ? "bg-white/10 text-white"
                : "hover:bg-white/5 text-white/60 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
            title="Shipping Management"
          >
            <Truck size={20} />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                Shipping Rates
              </span>
            )}
          </Link>
          <Link
            href="/admin/settings"
            className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all ${
              pathname === "/admin/settings"
                ? "bg-white/10 text-white"
                : "hover:bg-white/5 text-white/60 hover:text-white"
            } ${isCollapsed ? "justify-center" : ""}`}
            title="Global Settings"
          >
            <Settings
              size={20}
              className={
                pathname === "/admin/settings" ? "animate-spin-slow" : ""
              }
            />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                Global Settings
              </span>
            )}
          </Link>
          <button
            onClick={async () => {
              await authClient.signOut();
              router.push("/");
            }}
            className={`flex items-center gap-4 p-3.5 w-full text-left hover:bg-red-500/20 rounded-2xl transition-all text-red-300/60 hover:text-red-200 group ${isCollapsed ? "justify-center" : ""}`}
            title="End Session"
          >
            <LogOut
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                End Session
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden bg-[#ece0cc] relative h-full">
        <div className="h-full overflow-y-auto">
          {/* Decorative header blur */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#234d1b]/5 to-transparent pointer-events-none z-0" />

          <div className="p-4 md:p-8 lg:p-12 relative z-10 max-w-[1600px] mx-auto pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
