import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendEmailAsync } from "@/lib/email";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";
import {
  computeShippingCents,
  computeSubtotalCents,
  hasAnySubscription,
  SHIPPING_COST_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS
} from "@/lib/pricing";

export const runtime = "nodejs";

const lineSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().max(20),
  isSubscription: z.boolean()
});

const schema = z.object({
  email: z.string().email(),
  lines: z.array(lineSchema).min(1).max(20)
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Panier invalide" }, { status: 400 });
  }
  const { email, lines } = parsed.data;
  const session = await getServerSession(authOptions);

  // Charge les produits depuis la BDD (sécurité : on ne fait jamais confiance au prix client).
  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) } }
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  if (byId.size !== new Set(lines.map((l) => l.productId)).size) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 400 });
  }

  // Calcule les montants côté serveur.
  const itemsForOrder = lines.map((l) => {
    const p = byId.get(l.productId)!;
    const unit = l.isSubscription && p.subscriptionPriceCents ? p.subscriptionPriceCents : p.priceCents;
    return {
      product: p,
      quantity: l.quantity,
      unitCents: unit,
      isSubscription: l.isSubscription
    };
  });

  const subtotalCents = computeSubtotalCents(itemsForOrder);
  const containsSub = hasAnySubscription(itemsForOrder);
  const shippingCents = computeShippingCents(subtotalCents, containsSub);
  const totalCents = subtotalCents + shippingCents;

  // Crée la commande en pending.
  const order = await prisma.order.create({
    data: {
      userId: (session?.user as { id?: string } | undefined)?.id,
      email: email.toLowerCase(),
      subtotalCents,
      shippingCents,
      totalCents,
      status: "pending",
      items: {
        create: itemsForOrder.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitCents: i.unitCents,
          isSubscription: i.isSubscription
        }))
      }
    }
  });

  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // ─── Mode démo (sans clés Stripe valides) ───────────────────────────────
  if (!stripe) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "paid" } });
    sendEmailAsync({
      to: email.toLowerCase(),
      subject: `Confirmation de votre commande Pairs #${order.id.slice(0, 8).toUpperCase()}`,
      react: OrderConfirmationEmail({
        orderId: order.id,
        totalCents,
        lines: itemsForOrder.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          unitCents: i.unitCents,
          isSubscription: i.isSubscription
        }))
      })
    });
    return NextResponse.json({
      url: `${siteUrl}/checkout/success?orderId=${order.id}&mock=1`,
      mock: true
    });
  }

  // ─── Réutilise / crée le customer Stripe ─────────────────────────────────
  let stripeCustomerId: string | undefined;
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (dbUser?.stripeCustomerId) {
      stripeCustomerId = dbUser.stripeCustomerId;
    } else if (dbUser) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name ?? undefined,
        metadata: { userId: dbUser.id }
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: customer.id }
      });
    }
  }

  // ─── Mode subscription : tout le panier devient récurrent ───────────────
  // Stripe ne mélange pas paiement unique et abonnement dans une même session.
  // Règle simple : si AU MOINS une ligne est en abo, on met TOUT en abo mensuel.
  // (Pour faire les deux à la fois, il faudrait deux sessions Stripe distinctes.)
  const mode: "payment" | "subscription" = containsSub ? "subscription" : "payment";

  const lineItems = itemsForOrder.map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency: "eur",
      unit_amount: i.unitCents,
      product_data: {
        name: i.product.name + (i.isSubscription ? " (Abonnement mensuel)" : ""),
        images: [i.product.imageUrl],
        metadata: { productId: i.product.id }
      },
      ...(mode === "subscription"
        ? { recurring: { interval: "month" as const } }
        : {})
    }
  }));

  const checkoutSession = await stripe.checkout.sessions.create({
    mode,
    ...(stripeCustomerId
      ? { customer: stripeCustomerId }
      : { customer_email: email }),
    line_items: lineItems,
    allow_promotion_codes: true,
    automatic_tax: { enabled: false },
    billing_address_collection: "required",
    // Shipping : on l'ajoute uniquement en mode payment (Stripe ne supporte
    // pas shipping_options en mode subscription de façon simple).
    ...(mode === "payment"
      ? {
          shipping_address_collection: { allowed_countries: ["FR", "BE", "CH", "LU", "MC"] },
          shipping_options: [
            shippingCents === 0
              ? {
                  shipping_rate_data: {
                    display_name: "Livraison offerte",
                    type: "fixed_amount" as const,
                    fixed_amount: { amount: 0, currency: "eur" },
                    delivery_estimate: {
                      minimum: { unit: "business_day" as const, value: 2 },
                      maximum: { unit: "business_day" as const, value: 4 }
                    }
                  }
                }
              : {
                  shipping_rate_data: {
                    display_name: "Livraison standard",
                    type: "fixed_amount" as const,
                    fixed_amount: { amount: SHIPPING_COST_CENTS, currency: "eur" },
                    delivery_estimate: {
                      minimum: { unit: "business_day" as const, value: 2 },
                      maximum: { unit: "business_day" as const, value: 4 }
                    }
                  }
                }
          ]
        }
      : {}),
    success_url: `${siteUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    metadata: { orderId: order.id }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkoutSession.id }
  });

  return NextResponse.json({
    url: checkoutSession.url,
    freeShippingFrom: FREE_SHIPPING_THRESHOLD_CENTS
  });
}
