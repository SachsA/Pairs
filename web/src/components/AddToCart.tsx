"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string;
    priceCents: number;
    subscriptionPriceCents: number | null;
  };
}

export function AddToCart({ product }: Props) {
  const [mode, setMode] = useState<"once" | "sub">("once");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const isSub = mode === "sub" && !!product.subscriptionPriceCents;
  const unit = isSub ? product.subscriptionPriceCents! : product.priceCents;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      unitCents: unit,
      quantity: qty,
      isSubscription: isSub
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-4">
      {product.subscriptionPriceCents && (
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-ink/10 bg-cream-100 p-1">
          <button
            onClick={() => setMode("once")}
            className={`rounded-lg px-3 py-2 text-xs uppercase tracking-widest transition ${
              mode === "once" ? "bg-sage-700 text-cream-50" : "text-ink/60"
            }`}
          >
            À l'unité · {formatPrice(product.priceCents)}
          </button>
          <button
            onClick={() => setMode("sub")}
            className={`rounded-lg px-3 py-2 text-xs uppercase tracking-widest transition ${
              mode === "sub" ? "bg-sage-700 text-cream-50" : "text-ink/60"
            }`}
          >
            Abonnement · {formatPrice(product.subscriptionPriceCents)}
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-ink/20">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-sm"
            aria-label="Diminuer"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-2 text-sm"
            aria-label="Augmenter"
          >
            +
          </button>
        </div>
        <button onClick={handleAdd} className="btn-primary flex-1">
          {added ? "✓ Ajouté au panier" : "Ajouter au panier"}
        </button>
      </div>
      {isSub && (
        <p className="text-xs text-ink/60">
          Économisez {formatPrice(product.priceCents - product.subscriptionPriceCents!)} par mois. Sans engagement.
        </p>
      )}
    </div>
  );
}
