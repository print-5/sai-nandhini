"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  uom?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, qty: number) => void;
  removeFromCart: (id: string, uom?: string) => void;
  updateQty: (id: string, qty: number, uom?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("sai_nandhini_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error("Failed to parse cart", err);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("sai_nandhini_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: any, qty: number) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item._id === product._id && item.uom === product.uom,
      );
      if (existing) {
        return prev.map((item) =>
          item._id === product._id && item.uom === product.uom
            ? { ...item, qty: item.qty + qty }
            : item,
        );
      }
      return [
        ...prev,
        { ...product, qty, image: product.images?.[0] || product.image || "" },
      ];
    });
  };

  const removeFromCart = (id: string, uom?: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item._id === id && item.uom === uom)),
    );
  };

  const updateQty = (id: string, qty: number, uom?: string) => {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id && item.uom === uom ? { ...item, qty } : item,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
