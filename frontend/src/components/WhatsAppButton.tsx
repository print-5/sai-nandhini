"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function WhatsAppButton() {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data && data.contactPhone) {
            // Clean phone number (remove spaces, etc.)
            const cleanPhone = data.contactPhone.replace(/[^0-9]/g, "");
            setPhone(cleanPhone);
          }
        }
      } catch (error) {
        console.error("Error fetching settings for WhatsApp:", error);
      }
    };
    fetchSettings();
  }, []);

  if (!phone) return null;

  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle
        size={28}
        fill="white"
        className="group-hover:rotate-12 transition-transform"
      />
      <span className="absolute right-full mr-4 bg-white text-gray-800 px-4 py-2 rounded-xl text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Chat with us!
      </span>
    </a>
  );
}
