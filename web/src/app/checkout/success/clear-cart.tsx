"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/**
 * Vide le panier côté client après une commande confirmée.
 * Composant invisible, à monter dans la page success.
 */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
