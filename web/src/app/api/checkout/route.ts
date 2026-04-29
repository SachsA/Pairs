import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const lineSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  isSubscription: z.boolean()
});

const schema = z.object({
  email: z.string().email(),
  lines: z.array(lineSchema).min(1)
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Panier invalide" }, { status: 400 });
  }
  const { email, lines } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) } }
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  let totalCents = 0;
  const itemsForOrder = lines.map((l) => {
    const p = byId.get(l.productId);
    if (!p) throw new Error("Produit introuvable");
    const unit = l.isSubscription && p.subscriptionPriceCents ? p.subscriptionPriceCents : p.priceCents;
    totalCents += unit * l.quantity;
    return {
      product: p,
      quantity: l.quantity,
      unitCents: unit,
      isSubscription: l.isSubscription
    };
  });

  const order = await prisma.order.create({
    data: {
      email: email.toLowerCase(),
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

  // Mode dev sans clés Stripe valides : on simule un succès direct
  if (!stripe) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "paid" } });
    return NextResponse.json({
      url: `${siteUrl}/checkout/success?orderId=${order.id}&mock=1`,
      mock: true
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: itemsForOrder.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "eur",
        unit_amount: i.unitCents,
        product_data: {
          name: i.product.name + (i.isSubscription ? " (Abonnement mensuel)" : ""),
          images: [i.product.imageUrl]
        }
      }
    })),
    success_url: `${siteUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    metadata: { orderId: order.id }
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id }
  });

  return NextResponse.json({ url: session.url });
}
