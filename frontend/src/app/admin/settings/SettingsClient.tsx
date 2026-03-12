"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  Loader2,
  Store,
  ShieldCheck,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  Search,
  X,
  Image as ImageIcon,
  MessageSquare,
  DollarSign,
  Package,
  Truck,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Tab configuration
const TABS = [
  { id: "brand", label: "Brand Identity", icon: Store },
  { id: "payment", label: "Payment Gateway", icon: CreditCard },
  { id: "email", label: "Email Config", icon: Mail },
  { id: "seo", label: "SEO & Metadata", icon: Search },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "reviews", label: "Google Reviews", icon: MessageSquare },
];

// Reusable card wrapper
function SettingsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-10 shadow-sm border border-gray-50 ${className}`}
    >
      {children}
    </section>
  );
}

// Reusable card header
function CardHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 pb-6 border-b border-gray-50">
      <div className="w-10 h-10 sm:w-12 sm:h-12 p-2.5 bg-primary/5 rounded-xl text-primary flex items-center justify-center shrink-0">
        <div className="sm:scale-110">{icon}</div>
      </div>
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-black text-primary-dark uppercase tracking-tight">
          {title}
        </h2>
        <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}

// Reusable form label
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-semibold text-gray-700 mb-1.5 block">
      {children}
    </span>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 py-3 px-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-shadow placeholder:text-gray-400 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation";

// Toggle switch component
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer touch-manipulation"
      onClick={onChange}
    >
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ml-4 ${checked ? "bg-accent" : "bg-gray-200"
          }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"
            }`}
        />
      </div>
    </div>
  );
}

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: any;
}) {
  const [activeTab, setActiveTab] = useState("brand");
  // Initialize settings with proper defaults to prevent undefined errors
  const [settings, setSettings] = useState<any>(() => ({
    ...initialSettings,
    payment: initialSettings?.payment || {},
    smtp: initialSettings?.smtp || {},
    seo: initialSettings?.seo || {},
    socialMedia: initialSettings?.socialMedia || {},
    googleMyBusiness: initialSettings?.googleMyBusiness || {},
  }));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // Sync settings when initialSettings prop changes
  useEffect(() => {
    setSettings({
      ...initialSettings,
      payment: initialSettings?.payment || {},
      smtp: initialSettings?.smtp || {},
      seo: initialSettings?.seo || {},
      socialMedia: initialSettings?.socialMedia || {},
      googleMyBusiness: initialSettings?.googleMyBusiness || {},
    });
  }, [initialSettings]);

  const fetchAll = async () => {
    try {
      const settingsRes = await fetch("/api/admin/settings", {
        credentials: "include"
      });
      const sData = await settingsRes.json();
      setSettings(sData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      // Prepare data for backend
      const dataToSend = { ...settings };

      // If logo is a base64 data URL, send it as logoBase64
      if (dataToSend.logo && dataToSend.logo.startsWith('data:')) {
        dataToSend.logoBase64 = dataToSend.logo;
        delete dataToSend.logo;
      }

      // If favicon is a base64 data URL, send it as faviconBase64
      if (dataToSend.favicon && dataToSend.favicon.startsWith('data:')) {
        dataToSend.faviconBase64 = dataToSend.favicon;
        delete dataToSend.favicon;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Settings saved successfully");
        setMessage("Settings saved successfully!");
        // Refresh settings to get the uploaded URLs back
        const refreshRes = await fetch("/api/admin/settings", {
          credentials: "include"
        });
        const refreshedData = await refreshRes.json();
        setSettings(refreshedData);
      } else {
        const errorMsg = data.error || "Failed to save settings";
        toast.error(errorMsg);
        setMessage(errorMsg);
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.message || "Error saving settings";
      toast.error(errorMsg);
      setMessage(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white p-5 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-serif font-black text-primary-dark leading-none">
            Configuration
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-[10px] sm:text-sm">
            Manage your store's global preferences and system settings.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-3 shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 active:scale-[0.98] outline-none focus:ring-4 focus:ring-primary/10 touch-manipulation"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[24px] shadow-sm border border-gray-100 p-1.5 overflow-hidden">
        <div className="flex flex-row gap-1.5 overflow-x-auto scrollbar-hide snap-x transition-all px-0.5 pb-1 sm:pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-grow md:flex-grow-0 flex items-center justify-center md:justify-start gap-2 px-5 py-3 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-sm transition-all whitespace-nowrap snap-start focus:ring-2 focus:ring-primary/10 touch-manipulation min-w-fit ${isActive
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-gray-400 hover:bg-gray-50 bg-transparent"
                  }`}
              >
                <Icon size={14} className="shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Brand Identity Tab */}
          {activeTab === "brand" && (
            <SettingsCard>
              <CardHeader
                icon={<Store size={20} />}
                title="Brand Identity"
                description="Configure your store's basic information and branding"
              />
              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <FieldLabel>Store Logo</FieldLabel>
                  <div className="flex flex-col gap-3">
                    {settings.logo ? (
                      <div className="relative group w-full max-w-md h-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                          src={settings.logo}
                          alt="Logo"
                          className="w-full h-full object-contain p-4"
                          fill
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSettings({ ...settings, logo: "" })
                            }
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full max-w-md h-32 border-2 border-dashed border-gray-200 hover:border-accent rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation">
                        <ImageIcon size={24} className="text-gray-300 mb-2" />
                        <p className="text-xs font-bold text-primary-dark">
                          Upload Logo
                        </p>
                        <p className="text-[10px] text-gray-400">
                          PNG, JPG or SVG
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("File size must be less than 2MB");
                                return;
                              }
                              // For now, just set the file object - you'll need to upload it
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSettings({
                                  ...settings,
                                  logo: reader.result as string,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Recommended: PNG or SVG format, transparent background
                  </p>
                </div>

                {/* Favicon Upload */}
                <div>
                  <FieldLabel>Favicon</FieldLabel>
                  <div className="flex flex-col gap-3">
                    {settings.favicon ? (
                      <div className="relative group w-24 h-24 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                          src={settings.favicon}
                          alt="Favicon"
                          className="w-full h-full object-contain p-2"
                          fill
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSettings({ ...settings, favicon: "" })
                            }
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-24 h-24 border-2 border-dashed border-gray-200 hover:border-accent rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation">
                        <ImageIcon size={20} className="text-gray-300 mb-1" />
                        <p className="text-[9px] font-bold text-primary-dark">
                          Upload
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 1 * 1024 * 1024) {
                                toast.error("File size must be less than 1MB");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSettings({
                                  ...settings,
                                  favicon: reader.result as string,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Recommended: 32x32px or 64x64px, ICO or PNG format
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <FieldLabel>Shop Name</FieldLabel>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    value={settings.shopName || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, shopName: e.target.value })
                    }
                    placeholder="Your Shop Name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>Contact Email</FieldLabel>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="email"
                        className={`${INPUT_CLASS} pl-12`}
                        value={settings.contactEmail || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contactEmail: e.target.value,
                          })
                        }
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Contact Phone</FieldLabel>
                    <div className="relative">
                      <Phone
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="tel"
                        className={`${INPUT_CLASS} pl-12`}
                        value={settings.contactPhone || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contactPhone: e.target.value,
                          })
                        }
                        placeholder="+91 1234567890"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel>Business Address</FieldLabel>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-4 text-gray-400"
                      size={16}
                    />
                    <textarea
                      className={`${INPUT_CLASS} pl-12 min-h-[100px]`}
                      value={settings.address || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, address: e.target.value })
                      }
                      placeholder="Enter your business address"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>Announcement Banner</FieldLabel>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    value={settings.announcement || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, announcement: e.target.value })
                    }
                    placeholder="e.g., Free shipping on orders above ₹500!"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    This message will appear at the top of your website
                  </p>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Payment Gateway Tab */}
          {activeTab === "payment" && (
            <SettingsCard>
              <CardHeader
                icon={<CreditCard size={20} />}
                title="Payment Gateway"
                description="Configure Razorpay payment gateway settings"
              />
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <CreditCard size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Razorpay Integration
                      </p>
                      <p className="text-xs text-blue-700">
                        Get your API keys from{" "}
                        <a
                          href="https://dashboard.razorpay.com/app/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold hover:text-blue-900"
                        >
                          Razorpay Dashboard
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel>Razorpay Key ID</FieldLabel>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    value={settings.payment?.razorpayKeyId || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment: {
                          ...settings.payment,
                          razorpayKeyId: e.target.value,
                        },
                      })
                    }
                    placeholder="rzp_test_xxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)
                  </p>
                </div>

                <div>
                  <FieldLabel>Razorpay Key Secret</FieldLabel>
                  <div className="relative">
                    <input
                      type={showRzpSecret ? "text" : "password"}
                      className={`${INPUT_CLASS} pr-12`}
                      value={settings.payment?.razorpayKeySecret || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            razorpayKeySecret: e.target.value,
                          },
                        })
                      }
                      placeholder="••••••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRzpSecret(!showRzpSecret)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation rounded"
                    >
                      {showRzpSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Your Razorpay Key Secret (keep this confidential)
                  </p>
                </div>

                <div>
                  <FieldLabel>Webhook Secret (Optional)</FieldLabel>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    value={settings.payment?.razorpayWebhookSecret || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment: {
                          ...settings.payment,
                          razorpayWebhookSecret: e.target.value,
                        },
                      })
                    }
                    placeholder="whsec_xxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Webhook secret for payment verification (optional but
                    recommended)
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-900 mb-1">
                          Security Note
                        </p>
                        <p className="text-xs text-amber-700">
                          Never share your Key Secret publicly. Use test keys
                          for development and live keys only in production.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Email Configuration Tab */}
          {activeTab === "email" && (
            <SettingsCard>
              <CardHeader
                icon={<Mail size={20} />}
                title="Email Configuration"
                description="Configure SMTP settings for sending emails"
              />
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel>SMTP Host</FieldLabel>
                    <input
                      type="text"
                      className={INPUT_CLASS}
                      value={settings.smtp?.host || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: { ...settings.smtp, host: e.target.value },
                        })
                      }
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <FieldLabel>SMTP Port</FieldLabel>
                    <input
                      type="number"
                      className={INPUT_CLASS}
                      value={settings.smtp?.port || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: {
                            ...settings.smtp,
                            port: Number(e.target.value),
                          },
                        })
                      }
                      placeholder="587"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>SMTP Username</FieldLabel>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    value={settings.smtp?.user || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smtp: { ...settings.smtp, user: e.target.value },
                      })
                    }
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <FieldLabel>SMTP Password</FieldLabel>
                  <div className="relative">
                    <input
                      type={showSmtpPass ? "text" : "password"}
                      className={`${INPUT_CLASS} pr-12`}
                      value={settings.smtp?.password || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: { ...settings.smtp, password: e.target.value },
                        })
                      }
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation rounded"
                    >
                      {showSmtpPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Google Reviews Tab */}
          {activeTab === "reviews" && (
            <SettingsCard>
              <CardHeader
                icon={<MessageSquare size={20} />}
                title="Google My Business Reviews"
                description="Display authentic Google reviews on your website"
              />
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <MessageSquare size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-1">
                        Google Places API Setup
                      </p>
                      <p className="text-xs text-blue-700 mb-2">
                        Display your Google reviews using Google Places API
                        (simpler than My Business API).
                      </p>
                      <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                        <li>
                          Your Google Maps API Key should have "Places API"
                          enabled
                        </li>
                        <li>
                          Find your Place ID:{" "}
                          <a
                            href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-semibold"
                          >
                            Place ID Finder
                          </a>
                        </li>
                        <li>
                          Or search your business on Google Maps, copy the URL,
                          and extract the Place ID
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <ToggleSwitch
                  checked={settings.googleMyBusiness?.enabled || false}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      googleMyBusiness: {
                        ...settings.googleMyBusiness,
                        enabled: !settings.googleMyBusiness?.enabled,
                      },
                    })
                  }
                  label="Enable Google Reviews"
                  description="Display Google My Business reviews on your website"
                />

                <div className="border-t border-gray-100 pt-6">
                  <div>
                    <FieldLabel>Google Place ID</FieldLabel>
                    <input
                      type="text"
                      className={INPUT_CLASS}
                      value={settings.googleMyBusiness?.placeId || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          googleMyBusiness: {
                            ...settings.googleMyBusiness,
                            placeId: e.target.value,
                          },
                        })
                      }
                      placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Find your Place ID using the{" "}
                      <a
                        href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        Place ID Finder
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <FieldLabel>Google Maps API Key</FieldLabel>
                  <div className="relative">
                    <input
                      type="password"
                      className={INPUT_CLASS}
                      value={settings.googleMyBusiness?.apiKey || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          googleMyBusiness: {
                            ...settings.googleMyBusiness,
                            apiKey: e.target.value,
                          },
                        })
                      }
                      placeholder="AIzaSy••••••••••••••••••••••"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Your Google Maps API Key with Places API enabled (starts
                    with AIzaSy)
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-900 mb-1">
                          Important Notes
                        </p>
                        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                          <li>
                            Reviews are cached for 1 hour to avoid API rate
                            limits
                          </li>
                          <li>
                            Only approved reviews will be displayed publicly
                          </li>
                          <li>
                            Keep your API credentials secure and never share
                            them
                          </li>
                          <li>OAuth 2.0 is recommended for production use</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* SEO & Metadata Tab */}
          {activeTab === "seo" && (
            <SettingsCard>
              <CardHeader
                icon={<Search size={20} />}
                title="SEO & Metadata"
                description="Optimize your store for search engines"
              />
              <div className="space-y-6">
                <div>
                  <FieldLabel>Meta Title</FieldLabel>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    value={settings.seo?.metaTitle || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, metaTitle: e.target.value },
                      })
                    }
                    placeholder="Your Store Name - Best Products Online"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Recommended: 50-60 characters
                  </p>
                </div>

                <div>
                  <FieldLabel>Meta Description</FieldLabel>
                  <textarea
                    className={`${INPUT_CLASS} min-h-[100px]`}
                    value={settings.seo?.metaDescription || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: {
                          ...settings.seo,
                          metaDescription: e.target.value,
                        },
                      })
                    }
                    placeholder="Describe your store in 150-160 characters..."
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Recommended: 150-160 characters
                  </p>
                </div>

                <div>
                  <FieldLabel>Keywords</FieldLabel>
                  <input
                    type="text"
                    className={INPUT_CLASS}
                    value={settings.seo?.keywords || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, keywords: e.target.value },
                      })
                    }
                    placeholder="bakery, cakes, cookies, sweets"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <FieldLabel>Open Graph Image</FieldLabel>
                  <div className="flex flex-col gap-3">
                    {settings.seo?.ogImage ? (
                      <div className="relative group w-full max-w-md h-48 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                          src={settings.seo.ogImage}
                          alt="OG Image"
                          className="w-full h-full object-cover"
                          fill
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSettings({
                                ...settings,
                                seo: { ...settings.seo, ogImage: "" },
                              })
                            }
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full max-w-md h-48 border-2 border-dashed border-gray-200 hover:border-accent rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none touch-manipulation">
                        <ImageIcon size={32} className="text-gray-300 mb-2" />
                        <p className="text-xs font-bold text-primary-dark">
                          Upload OG Image
                        </p>
                        <p className="text-[10px] text-gray-400">
                          1200x630px recommended
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("File size must be less than 2MB");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setSettings({
                                  ...settings,
                                  seo: {
                                    ...settings.seo,
                                    ogImage: reader.result as string,
                                  },
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Image shown when your site is shared on social media
                    (1200x630px)
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <FieldLabel>Social Media Links</FieldLabel>
                  <div className="space-y-4">
                    <input
                      type="url"
                      className={INPUT_CLASS}
                      value={settings.socialMedia?.facebook || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            facebook: e.target.value,
                          },
                        })
                      }
                      placeholder="Facebook URL"
                    />
                    <input
                      type="url"
                      className={INPUT_CLASS}
                      value={settings.socialMedia?.instagram || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            instagram: e.target.value,
                          },
                        })
                      }
                      placeholder="Instagram URL"
                    />
                    <input
                      type="url"
                      className={INPUT_CLASS}
                      value={settings.socialMedia?.twitter || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialMedia: {
                            ...settings.socialMedia,
                            twitter: e.target.value,
                          },
                        })
                      }
                      placeholder="Twitter URL"
                    />
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Inventory Management Tab */}
          {activeTab === "inventory" && (
            <SettingsCard>
              <CardHeader
                icon={<Package size={20} />}
                title="Inventory Management"
                description="Global settings for tracking and managing product stock"
              />
              <div className="space-y-8">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900 mb-1">
                        Stock Control Policies
                      </p>
                      <p className="text-xs text-amber-700">
                        These settings affect how the store handles out-of-stock
                        items and when to notify you about low inventory levels.
                      </p>
                    </div>
                  </div>
                </div>

                <ToggleSwitch
                  checked={settings.manageInventory ?? true}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      manageInventory: !(settings.manageInventory ?? true),
                    })
                  }
                  label="Enable Global Inventory Tracking"
                  description="When enabled, the system will track stock quantities and prevent orders for out-of-stock items"
                />

                <div className="border-t border-gray-100 pt-8">
                  <div className="max-w-xs">
                    <FieldLabel>Low Stock Threshold</FieldLabel>
                    <div className="relative">
                      <Package
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type="number"
                        className={`${INPUT_CLASS} pl-12`}
                        value={settings.lowStockThreshold || 10}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            lowStockThreshold: Number(e.target.value),
                          })
                        }
                        placeholder="10"
                        min="0"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                      Items with stock below this number will be flagged in the
                      inventory dashboard.
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ToggleSwitch
                      checked={settings.allowOrderCancellation ?? true}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          allowOrderCancellation:
                            !settings.allowOrderCancellation,
                        })
                      }
                      label="Allow Order Cancellation"
                      description="Let customers cancel orders before they are processed"
                    />
                    {/* <ToggleSwitch
                      checked={settings.allowScheduledOrders ?? false}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          allowScheduledOrders: !settings.allowScheduledOrders,
                        })
                      }
                      label="Enable Scheduled Orders"
                      description="Allow customers to pick a delivery date during checkout"
                    /> */}
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
    </div>
  );
}
