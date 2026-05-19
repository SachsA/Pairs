import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ClearCartOnMount } from "./clear-cart";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({
  searchParams
}: {
  searchParams: { orderId?: string; mock?: string };
}) {
  const order = searchParams.orderId
    ? await prisma.order.findUnique({
        where: { id: searchParams.orderId },
        include: { items: { include: { product: true } } }
      })
    : null;

  const isPaid = order?.status === "paid";
  const isMock = searchParams.mock === "1";

  return (
    <div className="container-x py-24">
      <ClearCartOnMount />
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Merci</p>
        <h1 className="h-display mt-2">
          {isPaid ? "Votre commande est confirmée." : "Votre commande est en cours."}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/70">
          {isPaid
            ? "Un email de confirmation vous a été envoyé. Nous préparons votre rituel avec soin."
            : "Nous attendons la confirmation de votre paiement. Vous recevrez un email dès que tout est validé."}
          {isMock && " (Mode démo : aucun paiement réel n'a été effectué.)"}
        </p>
        {order && (
          <p className="mt-3 text-xs uppercase tracking-widest text-ink/50">
            Commande #{order.id.slice(0, 8).toUpperCase()}
          </p>
        )}
      </div>

      {order && (
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-ink/10 bg-cream-50 p-6">
          <h2 className="font-serif text-xl">Récapitulatif</h2>
          <ul className="mt-4 divide-y divide-ink/10">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between py-3 text-sm">
                <span>
                  {i.quantity} × {i.product.name}
                  {i.isSubscription && (
                    <span className="ml-2 text-xs uppercase tracking-widest text-sage-700">
                      abonnement
                    </span>
                  )}
                </span>
                <span>{formatPrice(i.unitCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-ink/60">
              <dt>Sous-total</dt>
              <dd>{formatPrice(order.subtotalCents)}</dd>
            </div>
            {order.shippingCents > 0 ? (
              <div className="flex justify-between text-ink/60">
                <dt>Livraison</dt>
                <dd>{formatPrice(order.shippingCents)}</dd>
              </div>
            ) : (
              <div className="flex justify-between text-sage-700">
                <dt>Livraison</dt>
                <dd>Offerte</dd>
              </div>
            )}
            {order.discountCents > 0 && (
              <div className="flex justify-between text-sage-700">
                <dt>Réduction</dt>
                <dd>− {formatPrice(order.discountCents)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalCents)}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/products" className="btn-primary">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
