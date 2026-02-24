"use client";

import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#2F3E2C",
            color: "#fff",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: "600",
            padding: "16px",
          },
          success: {
            iconTheme: {
              primary: "#C6A75E",
              secondary: "#fff",
            },
          },
        }}
      />
      {children}
    </CartProvider>
  );
}
