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
} from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
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
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const makePayment = async () => {
    if (
      !address.fullName ||
      !address.email ||
      !address.phone ||
      !address.street ||
      !address.city ||
      !address.pincode
    ) {
      alert("Please fill in all delivery details.");
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
        alert(
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
            alert(
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
            alert("Payment cancelled.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(
          `Payment Failed: ${response.error.description || "Unknown error"}`,
        );
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Checkout failed", err);
      alert("Checkout initialization failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
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
    <main className="min-h-screen bg-gray-50">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Navbar />

      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-4 w-full max-w-2xl px-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold relative z-10">
                <MapPin size={18} />
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                Address
              </span>
            </div>
            <div className="flex-grow h-[2px] bg-primary/20" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold">
                <CreditCard size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-2xl font-serif font-bold text-primary-dark flex items-center gap-3 mb-8">
                <MapPin className="text-primary" /> Delivery Details
              </h2>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) =>
                      setAddress({ ...address, fullName: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={address.email}
                    onChange={(e) =>
                      setAddress({ ...address, email: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    House No / Street
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address.street}
                    onChange={(e) =>
                      setAddress({ ...address, street: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress({ ...address, pincode: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-transparent focus:border-primary/20 rounded-2xl py-4 px-6 outline-none transition-all font-medium"
                  />
                </div>
              </form>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-2xl font-serif font-bold text-primary-dark flex items-center gap-3 mb-8">
                <CreditCard className="text-primary" /> Payment Method
              </h2>
              <div className="space-y-4">
                <label
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "prepaid" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "prepaid" ? "border-primary" : "border-gray-300"}`}
                    >
                      {paymentMethod === "prepaid" && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-primary-dark">
                        Online Payment
                      </p>
                      <p className="text-xs text-gray-500">
                        Cards, UPI, Netbanking
                      </p>
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

                <label
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"} ${!isCodAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-primary" : "border-gray-300"}`}
                    >
                      {paymentMethod === "cod" && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-primary-dark">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-gray-500">
                        {isCodAvailable
                          ? "Pay when you receive"
                          : "Not available for items in cart"}
                      </p>
                    </div>
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

            <div className="flex gap-6 justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" /> Multi-Layer
                Encryption
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" /> Verified
                Origin
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col h-fit">
              <h2 className="text-2xl font-serif font-bold text-primary-dark mb-8">
                Summary
              </h2>

              <div className="space-y-6 mb-10 pb-8 border-b border-gray-50 overflow-y-auto max-h-60 scrollbar-hide">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary/20 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xs font-bold text-primary-dark line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-bold text-gray-400">
                          QTY {item.qty}
                        </span>
                        <span className="text-sm font-bold text-primary-dark">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-xs font-medium text-gray-400">
                  <span>Products</span>
                  <span className="font-bold text-primary-dark">
                    ₹{itemsPrice}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-400">
                  <span>Packaging & Tax</span>
                  <span className="font-bold text-primary-dark">
                    ₹{taxPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-400">
                  <span>Shipping</span>
                  <span
                    className={
                      shippingPrice === 0
                        ? "text-green-500 font-bold"
                        : "font-bold text-primary-dark"
                    }
                  >
                    {shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-50 font-serif">
                  <span className="text-lg font-bold text-primary-dark">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={makePayment}
                disabled={loading}
                className="w-full bg-primary text-white py-6 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg hover:bg-primary-dark transition-all shadow-xl active:scale-95 disabled:opacity-70 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    {paymentMethod === "cod" ? "Place Order (COD)" : "Pay Now"}
                    <ChevronRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}
