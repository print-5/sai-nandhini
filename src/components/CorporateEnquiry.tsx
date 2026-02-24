"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Users, Calendar, Briefcase, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CorporateEnquiry() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Corporate Booking",
    message: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Enquiry sent successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          type: "Corporate Booking",
          message: "",
          date: "",
        });
      } else {
        toast.error("Failed to send enquiry. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#F8F6F2] border border-gray-200 focus:bg-white focus:border-[#C6A75E] focus:ring-2 focus:ring-[#C6A75E]/10 rounded-xl px-5 py-4 text-sm font-medium text-[#2F3E2C] outline-none transition-all placeholder:text-gray-400";

  if (success) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-100 p-10 rounded-3xl text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-emerald-800 mb-2">
              Request Received!
            </h3>
            <p className="text-emerald-600 text-sm leading-relaxed">
              Thank you for considering Sai Nandhini. Our corporate team will
              contact you within 24 hours.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 text-emerald-700 font-bold hover:underline text-sm"
            >
              Send another request
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6A75E]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Info */}
          <div className="space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C6A75E] block">
              Partner With Us
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-[#2F3E2C] tracking-tight">
              Bulk Orders & <br className="hidden md:block" />
              <span className="text-[#C6A75E] italic">Event Catering</span>
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-md text-sm">
              From office celebrations to grand weddings, bring the authentic
              taste of Madurai to your special occasions.
            </p>

            <div className="space-y-4 mt-6">
              {[
                {
                  icon: Briefcase,
                  title: "Corporate Gifting",
                  desc: "Custom hampers for employees & clients",
                },
                {
                  icon: Users,
                  title: "Large Gatherings",
                  desc: "Live counters & bulk sweet boxes",
                },
                {
                  icon: Calendar,
                  title: "Festival Specials",
                  desc: "Pre-booking for Diwali, Pongal & more",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 bg-[#F8F6F2] rounded-2xl border border-gray-100 hover:border-[#C6A75E]/20 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#2F3E2C]/10 rounded-xl flex items-center justify-center text-[#2F3E2C] shrink-0">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2F3E2C] text-base mb-0.5">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-[#F8F6F2] p-8 md:p-10 rounded-3xl border border-gray-100 shadow-lg shadow-[#2F3E2C]/3">
            <h3 className="text-lg font-bold text-[#2F3E2C] mb-6">
              Send an Enquiry
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={inputClass}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                    Company
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputClass}
                  placeholder="john@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={inputClass}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option>Corporate Booking</option>
                    <option>Event Catering</option>
                    <option>Bulk Order</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">
                  Requirements
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={`${inputClass} min-h-[120px] resize-none`}
                  placeholder="Tell us about the event..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C6A75E] text-[#2F3E2C] font-bold uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-[#C6A75E]/20 hover:bg-[#d4b76e] transition-all active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-70 group text-sm"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send Enquiry{" "}
                    <Send
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
