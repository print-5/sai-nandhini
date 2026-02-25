"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Save,
  Loader2,
  Store,
  Truck,
  ShieldCheck,
  Globe,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CreditCard,
  Eye,
  EyeOff,
  Search,
  Settings,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "@/components/admin/ImageUpload";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/admin/ConfirmationModal";

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
      className={`bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e5e7eb] ${className}`}
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
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
      <div className="p-2.5 bg-[#2F3E2C]/8 rounded-xl text-[#2F3E2C]">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-[#2F3E2C]">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
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

// Input class constants
const INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 py-3 px-4 outline-none focus:border-[#C6A75E] focus:ring-2 focus:ring-[#C6A75E]/20 transition-all placeholder:text-gray-400 text-sm";

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
      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onChange}
    >
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 ml-4 ${
          checked ? "bg-[#C6A75E]" : "bg-gray-200"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}

export default function SettingsClient({
  initialSettings,
  initialRates,
}: {
  initialSettings: any;
  initialRates: any[];
}) {
  const [settings, setSettings] = useState<any>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [deleteRateId, setDeleteRateId] = useState<string | null>(null);
  const [newTaxRate, setNewTaxRate] = useState({ name: "", rate: "" });

  // Shipping Rates State
  const [shippingRates, setShippingRates] = useState<any[]>(
    Array.isArray(initialRates)
      ? initialRates.sort((a: any, b: any) => a.minWeight - b.minWeight)
      : [],
  );
  const [newRate, setNewRate] = useState({ min: "", max: "", rate: "" });

  const fetchAll = async () => {
    try {
      const [settingsRes, ratesRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/shipping-rates"),
      ]);

      const sData = await settingsRes.json();
      const rData = await ratesRes.json();

      setSettings(sData);
      setShippingRates(
        Array.isArray(rData)
          ? rData.sort((a: any, b: any) => a.minWeight - b.minWeight)
          : [],
      );
    } catch (e) {
      console.error(e);
    }
  };

  const addRate = async () => {
    if (!newRate.min || !newRate.max || !newRate.rate) return;
    try {
      const res = await fetch("/api/admin/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minWeight: Number(newRate.min),
          maxWeight: Number(newRate.max),
          rate: Number(newRate.rate),
        }),
      });
      if (res.ok) {
        toast.success("Shipping rate added");
        const rate = await res.json();
        setShippingRates(
          [...shippingRates, rate].sort(
            (a: any, b: any) => a.minWeight - b.minWeight,
          ),
        );
        setNewRate({ min: "", max: "", rate: "" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRate = async () => {
    if (!deleteRateId) return;
    try {
      await fetch(`/api/admin/shipping-rates/${deleteRateId}`, {
        method: "DELETE",
      });
      setShippingRates(shippingRates.filter((r) => r._id !== deleteRateId));
      toast.success("Shipping rate deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete rate");
    } finally {
      setDeleteRateId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      // Clone settings and remove File objects for JSON stringification
      const settingsData = { ...settings };
      const logoFile =
        settingsData.logo instanceof File ? settingsData.logo : null;
      const faviconFile =
        settingsData.favicon instanceof File ? settingsData.favicon : null;

      if (logoFile) settingsData.logo = "";
      if (faviconFile) settingsData.favicon = "";

      formData.append("data", JSON.stringify(settingsData));
      if (logoFile) formData.append("logo", logoFile);
      if (faviconFile) formData.append("favicon", faviconFile);

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Configuration Saved successfully");
        // Refresh settings to get the new URLs
        const updated = await res.json();
        setSettings(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#C6A75E]" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8F6F2] font-['Inter',sans-serif]">
      <div className="mx-auto py-8 px-4 md:px-8">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <nav className="flex text-sm text-gray-400 mb-1.5 items-center gap-1">
              <span className="hover:text-[#2F3E2C] cursor-pointer transition-colors">
                Dashboard
              </span>
              <span className="mx-1 text-gray-300">/</span>
              <span className="text-[#2F3E2C] font-semibold">Settings</span>
            </nav>
            <h1 className="text-3xl font-bold text-[#2F3E2C] tracking-tight">
              Store Settings
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage your store configuration and preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className="bg-[#2F3E2C] text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Save size={14} /> {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <ConfirmationModal
          isOpen={!!deleteRateId}
          onClose={() => setDeleteRateId(null)}
          onConfirm={() => deleteRate()}
          title="Delete Shipping Rate"
          message="Are you sure you want to delete this shipping weighted rate?"
          confirmText="Delete"
          type="danger"
        />

        {/* Form */}
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* ═══════════════════════════════════════════
                Card 1: Brand Identity
            ═══════════════════════════════════════════ */}
            <SettingsCard>
              <CardHeader
                icon={<Store size={20} />}
                title="Brand Identity"
                description="General store information and contacts"
              />
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="block">
                    <FieldLabel>Shop Name</FieldLabel>
                    <input
                      type="text"
                      value={settings.shopName || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, shopName: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                  </label>
                  <label className="block">
                    <FieldLabel>Support Phone</FieldLabel>
                    <div className="relative">
                      <Phone
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        size={15}
                      />
                      <input
                        type="text"
                        value={settings.contactPhone || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            contactPhone: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} pl-10`}
                      />
                    </div>
                  </label>
                </div>

                <label className="block">
                  <FieldLabel>Support Email</FieldLabel>
                  <div className="relative">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={15}
                    />
                    <input
                      type="email"
                      value={settings.contactEmail || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactEmail: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} pl-10`}
                    />
                  </div>
                </label>

                <label className="block">
                  <FieldLabel>Store Address</FieldLabel>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3.5 top-3.5 text-gray-400"
                      size={15}
                    />
                    <textarea
                      rows={3}
                      value={settings.address || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, address: e.target.value })
                      }
                      className={`${INPUT_CLASS} pl-10 resize-none`}
                    />
                  </div>
                </label>

                {/* Assets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ImageUpload
                    label="Store Logo"
                    value={settings.logo || ""}
                    onChange={(val) => setSettings({ ...settings, logo: val })}
                  />
                  <ImageUpload
                    label="Favicon"
                    value={settings.favicon || ""}
                    onChange={(val) =>
                      setSettings({ ...settings, favicon: val })
                    }
                  />
                </div>
              </div>
            </SettingsCard>

            {/* ═══════════════════════════════════════════
                Card 2: Tax Management
            ═══════════════════════════════════════════ */}
            <SettingsCard>
              <CardHeader
                icon={<CreditCard size={20} />}
                title="Tax Management"
                description="Manage multiple tax rates for different categories"
              />
              <div className="space-y-6">
                {/* Add New Tax Rate */}
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">
                    Add New Tax Rate
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Tax Name (e.g., GST, VAT)"
                      value={newTaxRate.name}
                      onChange={(e) =>
                        setNewTaxRate({ ...newTaxRate, name: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Rate (%)"
                      value={newTaxRate.rate}
                      onChange={(e) =>
                        setNewTaxRate({ ...newTaxRate, rate: e.target.value })
                      }
                      className={INPUT_CLASS}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newTaxRate.name || !newTaxRate.rate) {
                          toast.error("Please fill all fields");
                          return;
                        }
                        const taxRates = settings.taxRates || [];
                        setSettings({
                          ...settings,
                          taxRates: [
                            ...taxRates,
                            {
                              name: newTaxRate.name,
                              rate: Number(newTaxRate.rate),
                              isDefault: taxRates.length === 0,
                            },
                          ],
                        });
                        setNewTaxRate({ name: "", rate: "" });
                        toast.success("Tax rate added");
                      }}
                      className="bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Existing Tax Rates */}
                <div className="space-y-3">
                  {settings.taxRates && settings.taxRates.length > 0 ? (
                    settings.taxRates.map((tax: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-bold text-primary-dark">
                              {tax.name}
                            </p>
                            <p className="text-sm text-gray-500">{tax.rate}%</p>
                          </div>
                          {tax.isDefault && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!tax.isDefault && (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedRates = settings.taxRates.map(
                                  (t: any, i: number) => ({
                                    ...t,
                                    isDefault: i === index,
                                  }),
                                );
                                setSettings({
                                  ...settings,
                                  taxRates: updatedRates,
                                });
                                toast.success("Default tax rate updated");
                              }}
                              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const updatedRates = settings.taxRates.filter(
                                (_: any, i: number) => i !== index,
                              );
                              setSettings({
                                ...settings,
                                taxRates: updatedRates,
                              });
                              toast.success("Tax rate removed");
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <CreditCard
                        size={40}
                        className="mx-auto mb-3 opacity-30"
                      />
                      <p>No tax rates configured yet</p>
                    </div>
                  )}
                </div>
              </div>
            </SettingsCard>

            {/* ═══════════════════════════════════════════
                Card 3: Logistics Settings
            ═══════════════════════════════════════════ */}
            <SettingsCard>
              <CardHeader
                icon={<Truck size={20} />}
                title="Logistics Settings"
                description="Shipping and inventory management"
              />
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <label className="block">
                    <FieldLabel>Low Stock Alert</FieldLabel>
                    <div className="relative">
                      <input
                        type="number"
                        value={settings.lowStockThreshold ?? ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            lowStockThreshold: Number(e.target.value),
                          })
                        }
                        className={`${INPUT_CLASS} pr-8`}
                      />
                      <AlertTriangle
                        className="absolute right-3 top-3.5 text-orange-400"
                        size={14}
                      />
                    </div>
                  </label>
                  <label className="block sm:col-span-1">
                    <FieldLabel>Inventory Control</FieldLabel>
                    <div className="pt-2">
                      <ToggleSwitch
                        checked={!!settings.manageInventory}
                        onChange={() =>
                          setSettings({
                            ...settings,
                            manageInventory: !settings.manageInventory,
                          })
                        }
                        label="Manage Inventory"
                        description="Track stock levels & hide OOS items"
                      />
                    </div>
                  </label>
                </div>

                {/* Shipping Management Link */}
                <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Truck className="text-primary mt-0.5" size={20} />
                    <div className="flex-grow">
                      <h3 className="text-sm font-bold text-primary-dark mb-1">
                        Weight-Based Shipping Rates
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Configure shipping charges based on order weight ranges.
                        Manage multiple rate tiers for different weight
                        brackets.
                      </p>
                      <Link
                        href="/admin/shipping"
                        className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                      >
                        Manage Shipping Rates
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="block">
                    <FieldLabel>Shipping Fee</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-gray-500 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={settings.shippingFee ?? ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shippingFee: Number(e.target.value),
                          })
                        }
                        className={`${INPUT_CLASS} pl-8`}
                      />
                    </div>
                  </label>
                  <label className="block">
                    <FieldLabel>Free Ship Above</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-gray-500 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={settings.freeShippingThreshold ?? ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            freeShippingThreshold: Number(e.target.value),
                          })
                        }
                        className={`${INPUT_CLASS} pl-8`}
                      />
                    </div>
                  </label>
                </div>

                {/* Payment Gateway Sub-Section */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-bold text-[#2F3E2C] mb-4 flex items-center gap-2">
                    <CreditCard size={16} className="text-[#C6A75E]" />
                    Payment Gateway (Razorpay)
                  </h3>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                        Key ID
                      </span>
                      <input
                        type="text"
                        placeholder="rzp_live_xxxxxxxxxxxx"
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
                        className="w-full rounded-lg border border-gray-200 bg-white text-sm py-2.5 px-3 outline-none focus:border-[#C6A75E] focus:ring-2 focus:ring-[#C6A75E]/20 font-mono"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                        Key Secret
                      </span>
                      <div className="relative">
                        <input
                          type={showRzpSecret ? "text" : "password"}
                          placeholder="••••••••"
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
                          className="w-full rounded-lg border border-gray-200 bg-white text-sm py-2.5 px-3 pr-10 outline-none focus:border-[#C6A75E] focus:ring-2 focus:ring-[#C6A75E]/20 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRzpSecret(!showRzpSecret)}
                          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showRzpSecret ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* ═══════════════════════════════════════════
                Card 3: Checkout Rules
            ═══════════════════════════════════════════ */}
            <SettingsCard>
              <CardHeader
                icon={<ShieldCheck size={20} />}
                title="Checkout Rules"
                description="Configure the customer checkout experience"
              />

              <div className="space-y-1">
                {/* <ToggleSwitch
                  checked={!!settings.shippingByWeight}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      shippingByWeight: !settings.shippingByWeight,
                    })
                  }
                  label="Weight Based Shipping"
                  description="Calculate fees based on total cart weight"
                /> */}
                <ToggleSwitch
                  checked={!!settings.allowOrderCancellation}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      allowOrderCancellation: !settings.allowOrderCancellation,
                    })
                  }
                  label="Order Cancellation"
                  description="Allow customers to cancel orders before shipping"
                />
                <ToggleSwitch
                  checked={!!settings.allowScheduledOrders}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      allowScheduledOrders: !settings.allowScheduledOrders,
                    })
                  }
                  label="Scheduled Delivery"
                  description="Enable delivery slot selection at checkout"
                />
              </div>

              {/* Weight Rate Table (Collapsible) */}
              <AnimatePresence>
                {settings.shippingByWeight && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-[#2F3E2C] text-xs uppercase tracking-wider mb-4">
                        Weight Rate Table
                      </h4>
                      <div className="space-y-2 mb-4">
                        {shippingRates.map((rate) => (
                          <div
                            key={rate._id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100"
                          >
                            <span className="text-xs font-semibold text-gray-500">
                              {rate.minWeight}kg – {rate.maxWeight}kg
                            </span>
                            <span className="text-xs font-bold text-[#2F3E2C]">
                              ₹{rate.rate}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteRateId(rate._id);
                              }}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {shippingRates.length === 0 && (
                          <p className="text-xs text-gray-400 italic text-center py-2">
                            No custom rates defined.
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          placeholder="Min kg"
                          type="number"
                          className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-[#C6A75E]/20"
                          value={newRate.min}
                          onChange={(e) =>
                            setNewRate({ ...newRate, min: e.target.value })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          placeholder="Max kg"
                          type="number"
                          className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-[#C6A75E]/20"
                          value={newRate.max}
                          onChange={(e) =>
                            setNewRate({ ...newRate, max: e.target.value })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <input
                          placeholder="₹ Rate"
                          type="number"
                          className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-xs font-medium outline-none focus:ring-2 focus:ring-[#C6A75E]/20"
                          value={newRate.rate}
                          onChange={(e) =>
                            setNewRate({ ...newRate, rate: e.target.value })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addRate();
                          }}
                          className="bg-[#2F3E2C] text-white p-2.5 rounded-lg hover:bg-[#1f2b1d] transition-colors shrink-0"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SettingsCard>

            {/* ═══════════════════════════════════════════
                Card 4: Email Configuration
            ═══════════════════════════════════════════ */}
            <SettingsCard>
              <CardHeader
                icon={<Mail size={20} />}
                title="Email Configuration"
                description="SMTP server settings for transactional emails"
              />
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="block">
                    <FieldLabel>SMTP Host</FieldLabel>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={settings.smtp?.host || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: {
                            ...(settings.smtp || {}),
                            host: e.target.value,
                          },
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </label>
                  <label className="block">
                    <FieldLabel>Port</FieldLabel>
                    <input
                      type="number"
                      placeholder="587"
                      value={settings.smtp?.port || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: {
                            ...(settings.smtp || {}),
                            port: Number(e.target.value),
                          },
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </label>
                  <label className="block">
                    <FieldLabel>Username</FieldLabel>
                    <input
                      type="text"
                      placeholder="user@example.com"
                      value={settings.smtp?.user || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          smtp: {
                            ...(settings.smtp || {}),
                            user: e.target.value,
                          },
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </label>
                  <label className="block">
                    <FieldLabel>Password</FieldLabel>
                    <div className="relative">
                      <input
                        type={showSmtpPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={settings.smtp?.password || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            smtp: {
                              ...(settings.smtp || {}),
                              password: e.target.value,
                            },
                          })
                        }
                        className={`${INPUT_CLASS} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        className="absolute right-2.5 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showSmtpPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </label>
                </div>

                {/* SSL Checkbox */}
                <div className="flex items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <input
                    type="checkbox"
                    id="ssl-checkbox"
                    checked={settings.smtp?.secure || false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smtp: {
                          ...(settings.smtp || {}),
                          secure: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-[#C6A75E] bg-gray-100 border-gray-300 rounded focus:ring-[#C6A75E] focus:ring-2"
                  />
                  <label
                    htmlFor="ssl-checkbox"
                    className="ms-3 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Enable SSL/TLS Security
                  </label>
                </div>
              </div>
            </SettingsCard>

            {/* ═══════════════════════════════════════════
                Card 5: SEO & Metadata (Full Width)
            ═══════════════════════════════════════════ */}
            <SettingsCard className="xl:col-span-2">
              <CardHeader
                icon={<Search size={20} />}
                title="SEO & Metadata"
                description="Optimize how your store appears on search engines"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <label className="block">
                    <FieldLabel>Meta Title</FieldLabel>
                    <input
                      type="text"
                      value={settings.seo?.metaTitle || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          seo: {
                            ...(settings.seo || {}),
                            metaTitle: e.target.value,
                          },
                        })
                      }
                      className={INPUT_CLASS}
                    />
                    <span className="text-xs text-gray-400 mt-1 block">
                      Recommended: 50–60 characters
                    </span>
                  </label>
                  <label className="block">
                    <FieldLabel>Meta Keywords</FieldLabel>
                    <input
                      type="text"
                      value={settings.seo?.keywords || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          seo: {
                            ...(settings.seo || {}),
                            keywords: e.target.value,
                          },
                        })
                      }
                      placeholder="sweets, snacks, indian food..."
                      className={INPUT_CLASS}
                    />
                  </label>
                </div>
                <label className="block">
                  <FieldLabel>Meta Description</FieldLabel>
                  <textarea
                    rows={5}
                    value={settings.seo?.metaDescription || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: {
                          ...(settings.seo || {}),
                          metaDescription: e.target.value,
                        },
                      })
                    }
                    className={`${INPUT_CLASS} resize-none h-full min-h-[140px]`}
                  />
                  <span className="text-xs text-gray-400 mt-1 block">
                    Recommended: 150–160 characters
                  </span>
                </label>
              </div>
            </SettingsCard>

            {/* ═══════════════════════════════════════════
                System Actions (Full Width)
            ═══════════════════════════════════════════ */}
            <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Maintenance Mode */}
              {/* <div className="bg-[#2F3E2C] p-6 md:p-8 rounded-2xl text-white flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold mb-0.5">
                    Maintenance Mode
                  </h4>
                  <p className="text-xs text-white/50">
                    Take store offline temporarily
                  </p>
                </div>
                <div
                  onClick={() =>
                    setSettings({
                      ...settings,
                      isMaintenanceMode: !settings.isMaintenanceMode,
                    })
                  }
                  className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                    settings.isMaintenanceMode ? "bg-[#C6A75E]" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      settings.isMaintenanceMode
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </div> */}
            </div>
          </div>

          {/* Sticky Save Button */}
          <div className="flex justify-end sticky bottom-6 z-20 pointer-events-none mt-8">
            <button
              type="submit"
              disabled={saving}
              className="pointer-events-auto bg-[#C6A75E] hover:bg-[#b0934e] text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#C6A75E]/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-12 mb-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} Sai Nandhini Tasty World. All rights
            reserved. <span className="mx-2">•</span> Admin Panel v1.2.0
          </p>
        </footer>
      </div>
    </div>
  );
}
