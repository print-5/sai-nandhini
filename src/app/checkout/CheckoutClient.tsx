"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Check,
  User,
  Mail,
  Phone,
  Home,
  Building2,
  MapPinned,
  Ticket,
  Package,
  IndianRupee,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import CouponInput from "@/components/CouponInput";
import Link from "next/link";

export default function CheckoutClient({
  initialSettings,
  initialShippingRates,
  initialCoupons,
}: {
  initialSettings: any;
  initialShippingRates?: any[];
  initialCoupons?: any[];
}) {
  const { data: session, isPending: status } = authClient.useSession();
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("prepaid");
  const [taxRate] = useState(() => {
    if (initialSettings.taxRates && initialSettings.taxRates.length > 0) {
      const defaultTax =
        initialSettings.taxRates.find((t: any) => t.isDefault) ||
        initialSettings.taxRates[0];
      return defaultTax.rate / 100;
    }
    return 0.05;
  });
  const isCodAvailable = cartItems.every(
    (item) => item.isCodAvailable !== false,
  );

  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    pincode: "",
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: string;
    value: number;
    discount: number;
    isFreeDelivery?: boolean;
    description?: string;
  } | null>(null);

  useEffect(() => {
    if (!status && !session) {
      router.push("/login?callbackUrl=/checkout");
    }
    if (session?.user) {
      setAddress((prev) => ({
        ...prev,
        fullName: session.user?.name || "",
        email: session.user?.email || "",
      }));
    }
  }, [session, status, router]);

  const itemsPrice = cartTotal;
  const taxPrice = itemsPrice * taxRate;

  // Dynamic Shipping Price Logic
  const calculateShipping = () => {
    if (appliedCoupon?.isFreeDelivery) return 0;

    // 1. Check if we have dynamic shipping slabs configured in Admin > Shipping
    if (initialShippingRates && initialShippingRates.length > 0) {
      const applicableRate = initialShippingRates.find(
        (rate) => itemsPrice >= rate.minAmount && itemsPrice < rate.maxAmount,
      );
      if (applicableRate) return applicableRate.rate;
    }

    // 2. Fallback to Global Settings (Free threshold)
    const freeShippingThreshold = initialSettings.freeShippingThreshold ?? 500;
    const standardShippingFee = initialSettings.shippingFee ?? 50;

    return itemsPrice >= freeShippingThreshold ? 0 : standardShippingFee;
  };

  const shippingPrice = calculateShipping();
  const discountAmount = appliedCoupon?.discount || 0;
  const totalPrice = Math.max(
    0,
    itemsPrice + taxPrice + shippingPrice - discountAmount,
  );

  const applyCouponCode = async (code: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          orderAmount: itemsPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to apply coupon");
        return;
      }

      setAppliedCoupon({
        code: data.data.code,
        type: data.data.type,
        value: data.data.value,
        discount: data.data.discount,
        isFreeDelivery: data.data.isFreeDelivery,
        description: data.data.description,
      });
      toast.success("Coupon applied successfully!");
    } catch (err) {
      toast.error("Failed to apply coupon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const makePayment = async () => {
    if (
      !address.fullName ||
      !address.email ||
      !address.phone ||
      !address.street ||
      !address.city ||
      !address.pincode
    ) {
      toast.error("Please fill in all delivery details.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order in Database
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItems: cartItems.map((item) => ({
            productId: item._id,
            name: item.name,
            qty: item.qty,
            image: item.image,
            price: item.price,
            uom: item.uom,
          })),
          shippingAddress: {
            fullName: address.fullName,
            email: address.email,
            phone: address.phone,
            address: address.street,
            city: address.city,
            pincode: address.pincode,
          },
          paymentMethod:
            paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay",
          itemsPrice,
          taxPrice,
          shippingPrice,
          discountPrice: discountAmount,
          totalPrice,
          couponCode: appliedCoupon?.code || null,
          discount: discountAmount,
        }),
      });
      const dbOrder = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(dbOrder.error || "Order creation failed");

      // Handle COD Order
      if (paymentMethod === "cod") {
        if (dbOrder._id) {
          clearCart();
          window.location.href = "/orders/success";
          return;
        } else {
          throw new Error("Order ID not returned for COD");
        }
      }

      // 2. Create Razorpay order (Prepaid)
      const payRes = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: dbOrder._id }), // Send orderId, not amount
      });
      const rzpOrder = await payRes.json();

      if (!payRes.ok) {
        console.error("Payment API Error:", rzpOrder);
        throw new Error(rzpOrder.error || "Payment initiation failed");
      }

      if (!rzpOrder.id)
        throw new Error("Could not create Razorpay order (ID missing)");

      if (!(window as any).Razorpay) {
        toast.error(
          "Razorpay SDK failed to load. Please check your internet connection.",
        );
        return;
      }

      const options = {
        key: rzpOrder.key, // Use key from backend response
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Sai Nandhini Tasty World",
        description: "Authentic South Indian Delicacies",
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrder._id, // Pass the real MongoDB ID
            }),
          });

          if (verifyRes.ok) {
            clearCart();
            window.location.href = "/orders/success";
          } else {
            const verifyData = await verifyRes.json();
            toast.error(
              `Payment verification failed: ${verifyData.error || "Unknown error"}`,
            );
          }
        },
        prefill: {
          name: address.fullName,
          email: address.email,
          contact: address.phone,
        },
        theme: { color: "#800000" },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.error("Payment cancelled.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(
          `Payment Failed: ${response.error.description || "Unknown error"}`,
        );
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Checkout failed", err);
      toast.error("Checkout initialization failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white relative z-0 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto">
            <Loader2 size={48} className="animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary-dark">
            Your basket is empty
          </h1>
          <Link
            href="/shop"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Return to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative z-0">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="pt-32 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between relative">
              {/* Background Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" />
              <div className="absolute top-6 left-0 w-1/2 h-0.5 bg-primary transition-all duration-500" />

              {/* Step 1 - Active */}
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg ring-4 ring-primary/20"
                >
                  <MapPin size={20} />
                </motion.div>
                <span className="text-xs font-semibold text-primary mt-3">
                  Delivery
                </span>
              </div>

              {/* Step 2 - Pending */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 text-gray-400 flex items-center justify-center shadow-sm">
                  <CreditCard size={20} />
                </div>
                <span className="text-xs font-semibold text-gray-400 mt-3">
                  Payment
                </span>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex flex-col items-center relative z-10">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 text-gray-400 flex items-center justify-center shadow-sm">
                  <Check size={20} />
                </div>
                <span className="text-xs font-semibold text-gray-400 mt-3">
                  Complete
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <MapPin className="text-white" size={20} />
                  </div>
                  Delivery Information
                </h2>
                <p className="text-white/80 text-sm mt-2">
                  Where should we deliver your order?
                </p>
              </div>

              <form className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={address.fullName}
                        onChange={(e) =>
                          setAddress({ ...address, fullName: e.target.value })
                        }
                        placeholder="Enter your full name"
                        className="w-full border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={address.email}
                        onChange={(e) =>
                          setAddress({ ...address, email: e.target.value })
                        }
                        placeholder="your@email.com"
                        className="w-full border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={address.phone}
                        onChange={(e) =>
                          setAddress({ ...address, phone: e.target.value })
                        }
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <textarea
                        rows={3}
                        required
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                        placeholder="House number, building name, street name"
                        className="w-full border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm resize-none bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) =>
                          setAddress({ ...address, city: e.target.value })
                        }
                        placeholder="Enter city"
                        className="w-full border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPinned className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={address.pincode}
                        onChange={(e) =>
                          setAddress({ ...address, pincode: e.target.value })
                        }
                        placeholder="6-digit pincode"
                        className="w-full border-2 border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Payment Method Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-white" size={20} />
                  </div>
                  Payment Method
                </h2>
                <p className="text-white/80 text-sm mt-2">
                  Choose your preferred payment option
                </p>
              </div>

              <div className="p-8 space-y-4">
                {/* Online Payment Option */}
                <label
                  className={`group flex items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "prepaid"
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center h-6">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        paymentMethod === "prepaid"
                          ? "border-primary bg-primary"
                          : "border-gray-300 group-hover:border-gray-400"
                      }`}
                    >
                      {paymentMethod === "prepaid" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 rounded-full bg-white"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <p className="font-bold text-primary-dark text-lg">
                        Online Payment
                      </p>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Pay securely using Cards, UPI, Net Banking & more
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5">
                        💳 Cards
                      </span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5">
                        📱 UPI
                      </span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5">
                        🏦 Net Banking
                      </span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg flex items-center gap-1.5">
                        💰 Wallets
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    className="hidden"
                    checked={paymentMethod === "prepaid"}
                    onChange={() => setPaymentMethod("prepaid")}
                  />
                </label>

                {/* Cash on Delivery Option */}
                <label
                  className={`group flex items-start gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  } ${!isCodAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center h-6">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary"
                          : "border-gray-300 group-hover:border-gray-400"
                      }`}
                    >
                      {paymentMethod === "cod" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 rounded-full bg-white"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      <p className="font-bold text-primary-dark text-lg">
                        Cash on Delivery
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {isCodAvailable
                        ? "Pay with cash when your order arrives"
                        : "Not available for selected items"}
                    </p>
                    {!isCodAvailable && (
                      <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                        ⚠️ Some items in your cart don't support COD
                      </p>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    className="hidden"
                    checked={paymentMethod === "cod"}
                    onChange={() => isCodAvailable && setPaymentMethod("cod")}
                    disabled={!isCodAvailable}
                  />
                </label>
              </div>
            </motion.div>

            {/* Security Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-900">
                    SSL Encrypted
                  </p>
                  <p className="text-xs text-green-700">100% Secure</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900">
                    Verified Seller
                  </p>
                  <p className="text-xs text-blue-700">Trusted Origin</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-900">
                    Safe Payment
                  </p>
                  <p className="text-xs text-purple-700">PCI Compliant</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <aside className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-24 overflow-hidden"
            >
              {/* Summary Header with Gradient */}
              <div className="bg-gradient-to-r from-[#C6A75E] to-[#d4b876] px-8 py-6">
                <h2 className="text-xl font-bold text-white">Order Summary</h2>
                <p className="text-white/80 text-sm mt-1">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar">
                {/* Items List */}
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0 relative shadow-sm">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          fill
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-semibold text-primary-dark line-clamp-2 mb-2">
                          {item.name}
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md">
                            Qty: {item.qty}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            ₹{(item.price * item.qty).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      Subtotal
                    </span>
                    <span className="font-semibold text-primary-dark">
                      ₹{itemsPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Shipping Progress Bar */}
                  {shippingPrice > 0 && (
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <span>Free Shipping Progress</span>
                        <span>
                          {Math.min(
                            100,
                            Math.round(
                              (itemsPrice /
                                (initialSettings.freeShippingThreshold ||
                                  500)) *
                                100,
                            ),
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, (itemsPrice / (initialSettings.freeShippingThreshold || 500)) * 100)}%`,
                          }}
                          className="h-full bg-primary"
                        />
                      </div>
                      {itemsPrice <
                        (initialSettings.freeShippingThreshold || 500) && (
                        <p className="text-[10px] text-primary font-medium text-center">
                          Shop for ₹
                          {(initialSettings.freeShippingThreshold || 500) -
                            itemsPrice}{" "}
                          more to get FREE shipping!
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Ticket size={16} className="text-gray-400" />
                      Tax & Packaging
                    </span>
                    <span className="font-semibold text-primary-dark">
                      ₹{taxPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      Shipping
                    </span>
                    <span
                      className={`font-semibold ${
                        shippingPrice === 0
                          ? "text-green-600"
                          : "text-primary-dark"
                      }`}
                    >
                      {shippingPrice === 0 ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={14} /> FREE
                        </span>
                      ) : (
                        `₹${shippingPrice}`
                      )}
                    </span>
                  </div>

                  {/* Coupon Section */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <CouponInput
                      orderAmount={itemsPrice}
                      onApplyCoupon={setAppliedCoupon}
                      onRemoveCoupon={() => setAppliedCoupon(null)}
                      appliedCoupon={appliedCoupon}
                    />

                    {/* Available Coupons List */}
                    {!appliedCoupon &&
                      initialCoupons &&
                      initialCoupons.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Available Coupons
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {initialCoupons
                              .filter(
                                (c) =>
                                  c.isActive &&
                                  c.displayInCheckout &&
                                  (!c.expiresAt ||
                                    new Date(c.expiresAt) > new Date()) &&
                                  (c.usageLimit === undefined ||
                                    (c.usedCount || 0) < c.usageLimit),
                              )
                              .map((coupon) => (
                                <button
                                  key={coupon._id}
                                  onClick={() => applyCouponCode(coupon.code)}
                                  disabled={loading}
                                  className="group bg-[#F8F6F2] hover:bg-primary/5 border border-gray-200 hover:border-primary/30 py-2 px-3 rounded-xl transition-all text-left disabled:opacity-50"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-primary tracking-wider uppercase">
                                      {coupon.code}
                                    </span>
                                    <Ticket
                                      size={10}
                                      className="text-primary/50"
                                    />
                                  </div>
                                  <p className="text-[10px] text-gray-500 line-clamp-1 group-hover:text-gray-700">
                                    {coupon.description ||
                                      (coupon.discountType === "percentage"
                                        ? `${coupon.discountValue}% OFF`
                                        : coupon.discountType === "fixed"
                                          ? `₹${coupon.discountValue} OFF`
                                          : "Free Delivery")}
                                  </p>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Discount Display */}
                  {discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-between text-sm p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                    >
                      <span className="text-green-700 font-semibold flex items-center gap-2">
                        <Ticket size={16} />
                        Discount ({appliedCoupon?.code})
                      </span>
                      <span className="text-green-700 font-bold">
                        -₹{discountAmount.toFixed(2)}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />

                {/* Total Amount */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
                    <span className="text-gray-700 font-semibold">
                      Total Amount
                    </span>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        ₹{totalPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Inclusive of all taxes
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={makePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-base transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        {paymentMethod === "cod"
                          ? "Place Order"
                          : "Proceed to Payment"}
                        <ChevronRight
                          size={20}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span className="font-semibold">
                      100% Secure & Encrypted Payment
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </main>
  );
}
