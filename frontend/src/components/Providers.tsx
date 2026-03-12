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
      {children}
    </CartProvider>
  );
}
