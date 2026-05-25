"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            const next = Math.min(
              existing.quantity + quantity,
              item.stockCount || 99
            );
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: next } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.stockCount || 99) },
            ],
            isOpen: true,
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: Math.max(
                      1,
                      Math.min(quantity, i.stockCount || 99)
                    ),
                  }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "studio-cart" }
  )
);

/** Derived selectors */
export const cartCount = (items: CartItem[]) =>
  items.reduce((n, i) => n + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
