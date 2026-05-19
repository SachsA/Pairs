"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useSession } from "next-auth/react";
import {
  computeShippingCents,
  hasAnySubscription,
  FREE_SHIPPING_THRESHOLD_CENTS
} from "@/lib/pricing";

export default function CartPage() {
  const { data: session } = useSession();
  const lines = useCart((s) => s.lines);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const subtotalCents = useCart((s) => s.totalCents());
  const containsSub = hasAnySubscription(lines);
  const shippingCents = computeShippingCents(subtotalCents, containsSub);
  const totalCents = subtotalCents + shippingCents;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || session?.user?.email,
          lines: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            isSubscription: l.isSubscription
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? "Erreur");
      setLoading(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <p className="eyebrow">Panier</p>
        <h1 className="h-display mt-2">Votre panier est vide</h1>
        <Link href="/products" className="btn-primary mt-8">
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-16">
      <p className="eyebrow">Panier</p>
      <h1 className="h-display mt-2">Votre commande</h1>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {lines.map((l) => (
            <div
              key={`${l.productId}-${l.isSubscription}`}
              className="flex gap-4 rounded-2xl border border-ink/10 bg-cream-50 p-4"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                <Image src={l.imageUrl} alt={l.name} fill sizes="96px" className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <Link href={`/products/${l.slug}`} className="font-serif text-lg hover:underline">
                    {l.name}
                  </Link>
                  <span className="font-medium">{formatPrice(l.unitCents * l.quantity)}</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-ink/60">
                  {l.isSubscription ? "Abonnement mensuel" : "Achat unique"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-ink/20">
                    <button
                      onClick={() => updateQty(l.productId, l.isSubscription, l.quantity - 1)}
                      className="px-3 py-1 text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{l.quantity}</span>
                    <button
                      onClick={() => updateQty(l.productId, l.isSubscription, l.quantity + 1)}
                      className="px-3 py-1 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(l.productId, l.isSubscription)}
                    className="text-xs uppercase tracking-widest text-ink/50 hover:text-ink"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-cream-100 p-6">
          <h3 className="font-serif text-xl">Récapitulatif</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Sous-total</dt>
              <dd>{formatPrice(subtotalCents)}</dd>
            </div>
            {containsSub ? (
              <div className="flex justify-between text-ink/60">
                <dt>Livraison</dt>
                <dd>Incluse (abonnement)</dd>
              </div>
            ) : shippingCents === 0 ? (
              <div className="flex justify-between text-sage-700">
                <dt>Livraison</dt>
                <dd>Offerte</dd>
              </div>
            ) : (
              <div className="flex justify-between text-ink/60">
                <dt>Livraison</dt>
                <dd>{formatPrice(shippingCents)}</dd>
              </div>
            )}
            <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(totalCents)}</dd>
            </div>
          </dl>
          {remainingForFreeShipping > 0 && !containsSub && (
            <p className="mt-3 rounded-lg bg-cream-50 px-3 py-2 text-xs text-sage-700">
              Plus que <strong>{formatPrice(remainingForFreeShipping)}</strong> pour la livraison offerte.
            </p>
          )}
          {!session?.user && (
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              className="mt-5 w-full rounded-full border border-ink/20 bg-cream-50 px-5 py-3 text-sm focus:border-sage-700 focus:outline-none"
            />
          )}
          <button onClick={checkout} disabled={loading} className="btn-primary mt-4 w-full">
            {loading ? "Redirection…" : "Passer au paiement"}
          </button>
          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
          <p className="mt-3 text-xs text-ink/50">
            Paiement sécurisé via Stripe. CB acceptée.
          </p>
        </aside>
      </div>
    </div>
  );
}
