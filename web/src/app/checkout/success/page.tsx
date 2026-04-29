"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export default function CheckoutSuccess({
  searchParams
}: {
  searchParams: { orderId?: string; mock?: string };
}) {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="container-x py-24 text-center">
      <p className="eyebrow">Merci</p>
      <h1 className="h-display mt-2">Votre commande est confirmée.</h1>
      <p className="mx-auto mt-4 max-w-xl text-ink/70">
        Un email de confirmation vous a été envoyé.
        {searchParams.mock && " (Mode démo : aucun paiement réel n'a été effectué.)"}
      </p>
      {searchParams.orderId && (
        <p className="mt-3 text-xs uppercase tracking-widest text-ink/50">
          Commande #{searchParams.orderId.slice(0, 8)}
        </p>
      )}
      <Link href="/products" className="btn-primary mt-8">
        Continuer mes achats
      </Link>
    </div>
  );
}
