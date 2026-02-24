"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import CouponInput from "@/components/CouponInput";
import Link from "next/link";

export default function CheckoutPage() {
  const { data: session, isPending: status } = authClient.useSession();
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("prepaid");
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
  const taxPrice = itemsPrice * 0.05;
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const discountAmount = appliedCoupon?.discount || 0;
  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

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
        <Navbar />
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
    <main className="min-h-screen bg-white relative z-0">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Navbar />

      <div className="pt-40 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simple Progress Indicator */}
        <div className="mb-14">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">
                <MapPin size={20} />
              </div>
              <span className="text-xs font-bold text-primary mt-2 uppercase text-center">
                Address
              </span>
            </div>

            {/* Connector Line */}
            <div className="h-1 bg-gradient-to-r from-primary to-gray-300 flex-grow min-w-[30px] max-w-[150px]" />

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">
                <CreditCard size={20} />
              </div>
              <span className="text-xs font-bold text-gray-500 mt-2 uppercase text-center">
                Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-primary-dark flex items-center gap-3">
                  <MapPin className="text-primary" size={22} />
                  Delivery Details
                </h2>
              </div>

              <form className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) =>
                        setAddress({ ...address, fullName: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={address.email}
                      onChange={(e) =>
                        setAddress({ ...address, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) =>
                        setAddress({ ...address, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                      House No / Street Address
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm resize-none"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                      City / Town
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      value={address.pincode}
                      onChange={(e) =>
                        setAddress({ ...address, pincode: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-primary-dark flex items-center gap-3">
                  <CreditCard className="text-primary" size={22} />
                  Payment Method
                </h2>
              </div>

              <div className="p-8 space-y-3">
                {/* Online Payment Option */}
                <label
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "prepaid"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "prepaid"
                        ? "border-primary bg-primary"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "prepaid" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-primary-dark">
                      Online Payment
                    </p>
                    <p className="text-xs text-gray-500">
                      Cards, UPI, Netbanking
                    </p>
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
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  } ${!isCodAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary"
                        : "border-gray-400"
                    }`}
                  >
                    {paymentMethod === "cod" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-primary-dark">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-gray-500">
                      {isCodAvailable
                        ? "Pay when you receive your order"
                        : "Not available for items in cart"}
                    </p>
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
            </div>

            {/* Security Badges */}
            <div className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-600">
                    SSL Encrypted
                  </p>
                  <p className="text-xs text-gray-500">Secure checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={20}
                  className="text-primary flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-gray-600">
                    Trusted Seller
                  </p>
                  <p className="text-xs text-gray-500">Verified origin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 sticky top-32">
              {/* Summary Header */}
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-primary-dark">
                  Order Summary
                </h2>
              </div>

              <div className="p-8 space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto">
                {/* Items List - Better Display */}
                <div className="space-y-5">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-semibold text-primary-dark line-clamp-2">
                          {item.name}
                        </h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            x{item.qty}
                          </span>
                          <span className="text-sm font-bold text-primary-dark">
                            ₹{(item.price * item.qty).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200" />

                {/* Price Breakdown - Cleaner */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-primary-dark">
                      ₹{itemsPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax & Packaging</span>
                    <span className="font-semibold text-primary-dark">
                      ₹{taxPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span
                      className={`font-semibold ${
                        shippingPrice === 0
                          ? "text-green-600"
                          : "text-primary-dark"
                      }`}
                    >
                      {shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}
                    </span>
                  </div>

                  {/* Coupon Section */}
                  <div className="pt-3 border-t border-gray-200">
                    <CouponInput
                      orderAmount={itemsPrice + taxPrice + shippingPrice}
                      onApplyCoupon={setAppliedCoupon}
                      onRemoveCoupon={() => setAppliedCoupon(null)}
                      appliedCoupon={appliedCoupon}
                    />
                  </div>

                  {/* Discount Display */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-700 font-semibold">
                        Discount ({appliedCoupon?.code})
                      </span>
                      <span className="text-green-700 font-bold">
                        -₹{discountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-300" />

                {/* Total Amount - Large and Prominent */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 font-semibold">
                      Total Amount
                    </span>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        ₹{totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button - Large and Prominent */}
                  <button
                    onClick={makePayment}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg flex items-center justify-center gap-2 font-bold text-base transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        {paymentMethod === "cod"
                          ? "Place Order"
                          : "Proceed to Payment"}
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>

                  <p className="text-xs font-bold text-gray-500 text-center uppercase tracking-wide">
                    ✓ 100% Secure & Encrypted
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
