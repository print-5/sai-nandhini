"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQty, cartTotal, cartCount } =
    useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white h-full relative z-10 shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-primary/5 flex justify-between items-center mt-20 bg-secondary/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-primary-dark" />
                <h2 className="text-2xl font-serif font-black text-primary-dark">
                  Your Basket
                </h2>
                <span className="bg-white text-primary text-[10px] font-sans font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10 shadow-sm">
                  {cartCount} ITEMS
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-primary/40 hover:text-primary-dark transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-[#FCFCFA]">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center text-primary/20 mb-4">
                    <ShoppingBag size={40} />
                  </div>
                  <p className="text-primary/40 font-sans font-black uppercase tracking-widest text-xs">
                    Your basket is empty
                  </p>
                  <button
                    onClick={onClose}
                    className="text-primary-dark font-serif font-bold text-lg hover:underline decoration-accent underline-offset-4"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={`${item._id}-${item.uom}`}
                    className="flex gap-6 group"
                  >
                    <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-primary/5 shadow-sm">
                      <img
                        src={
                          item.image ||
                          "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=100"
                        }
                        className="w-full h-full object-cover"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-primary-dark font-serif text-lg leading-tight line-clamp-2">
                            {item.name}
                          </h4>
                          {item.uom && (
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mt-1">
                              {item.uom}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id, item.uom)}
                          className="text-primary/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center gap-3 bg-white border border-primary/5 rounded-xl px-2 py-1 shadow-sm">
                          <button
                            onClick={() =>
                              updateQty(item._id, item.qty - 1, item.uom)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-secondary/20 text-primary/40 hover:text-primary-dark transition-all"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-sans font-black w-4 text-center text-primary-dark">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(item._id, item.qty + 1, item.uom)
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-secondary/20 text-primary/40 hover:text-primary-dark transition-all"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="font-sans font-black text-primary-dark text-lg">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-8 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] border-t border-primary/5 z-20 relative">
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm text-primary/60 font-sans font-bold">
                    <span>Subtotal</span>
                    <span className="text-primary-dark">
                      ₹{cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-primary/60 font-sans font-bold">
                    <span>Shipping</span>
                    <span className="text-accent font-black uppercase text-[10px] tracking-widest">
                      Calculated at Checkout
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-6 border-t border-dashed border-primary/10 mt-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-sans font-black uppercase tracking-widest text-primary/40">
                        Total
                      </span>
                      <span className="text-2xl font-serif font-black text-primary-dark">
                        INR {cartTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full bg-primary-dark text-white py-4 rounded-2xl font-sans font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-accent hover:text-primary-dark transition-all active:scale-[0.98] group"
                >
                  Proceed to Checkout{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
