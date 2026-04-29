"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  unitCents: number;
  quantity: number;
  isSubscription: boolean;
}

interface CartState {
  lines: CartLine[];
  addItem: (line: CartLine) => void;
  removeItem: (productId: string, isSubscription: boolean) => void;
  updateQty: (productId: string, isSubscription: boolean, qty: number) => void;
  clear: () => void;
  totalCents: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (line) => {
        const lines = [...get().lines];
        const existing = lines.find(
          (l) => l.productId === line.productId && l.isSubscription === line.isSubscription
        );
        if (existing) {
          existing.quantity += line.quantity;
        } else {
          lines.push(line);
        }
        set({ lines });
      },
      removeItem: (productId, isSubscription) =>
        set({
          lines: get().lines.filter(
            (l) => !(l.productId === productId && l.isSubscription === isSubscription)
          )
        }),
      updateQty: (productId, isSubscription, quantity) =>
        set({
          lines: get().lines.map((l) =>
            l.productId === productId && l.isSubscription === isSubscription
              ? { ...l, quantity: Math.max(1, quantity) }
              : l
          )
        }),
      clear: () => set({ lines: [] }),
      totalCents: () => get().lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0)
    }),
    { name: "pairs-cart" }
  )
);
