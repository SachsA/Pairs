import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendEmailAsync } from "@/lib/email";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";

export const runtime = "nodejs";
// Indispensable : le webhook Stripe doit recevoir le corps RAW (pas parsé).
export const dynamic = "force-dynamic";

/**
 * Webhook Stripe — point d'entrée pour confirmer les paiements et synchroniser
 * les abonnements.
 *
 * Sécurité :
 *  - Vérification de la signature Stripe (STRIPE_WEBHOOK_SECRET).
 *  - Idempotence : on vérifie le statut avant de marquer paid / d'envoyer l'email.
 *
 * Events écoutés :
 *  - checkout.session.completed       : commande payée (one-shot OU début d'abo)
 *  - invoice.paid                     : prélèvement mensuel d'un abonnement réussi
 *  - invoice.payment_failed           : échec de prélèvement
 *  - customer.subscription.updated    : changement de statut (annulation, etc.)
 *  - customer.subscription.deleted    : abonnement supprimé
 *
 * Configuration côté Stripe (dashboard) :
 *  Developers → Webhooks → Add endpoint
 *  URL : https://ton-domaine.fr/api/stripe/webhook
 *  Events : les 5 listés ci-dessus.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret || webhookSecret.includes("placeholder")) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("⚠ Webhook signature invalide :", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        // Event non géré — pas une erreur, on ignore.
        break;
    }
  } catch (err) {
    console.error(`✗ Erreur traitement webhook ${event.type} :`, err);
    // On renvoie 500 pour que Stripe retry. Le handler doit être idempotent.
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.warn("checkout.session.completed sans orderId dans metadata");
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } }
  });
  if (!order) {
    console.warn(`Order ${orderId} introuvable`);
    return;
  }

  // Idempotence : si déjà paid, on ne refait rien.
  if (order.status === "paid") return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      stripePaymentIntent:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      // Si Stripe a appliqué un code promo, on enregistre la réduction
      discountCents: session.total_details?.amount_discount ?? 0,
      shippingCents: session.total_details?.amount_shipping ?? order.shippingCents,
      totalCents: session.amount_total ?? order.totalCents
    }
  });

  // Si c'était une session subscription, on crée/synchronise la Subscription.
  if (session.mode === "subscription" && session.subscription) {
    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const sub = await stripe.subscriptions.retrieve(subId);
    await syncSubscription(sub);
  }

  // Email de confirmation (non-bloquant).
  sendEmailAsync({
    to: order.email,
    subject: `Confirmation de votre commande Pairs #${order.id.slice(0, 8).toUpperCase()}`,
    react: OrderConfirmationEmail({
      orderId: order.id,
      totalCents: session.amount_total ?? order.totalCents,
      lines: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        unitCents: i.unitCents,
        isSubscription: i.isSubscription
      }))
    })
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Prélèvement mensuel réussi : on met à jour l'abonnement.
  const subId =
    typeof (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription })
      .subscription === "string"
      ? ((invoice as Stripe.Invoice & { subscription?: string }).subscription as string)
      : null;
  if (!subId) return;

  const stripe = getStripe();
  if (!stripe) return;
  const sub = await stripe.subscriptions.retrieve(subId);
  await syncSubscription(sub);
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  // On note l'échec — un email de relance pourra être branché ici plus tard.
  console.warn("Invoice failed :", invoice.id, invoice.customer_email);
}

async function syncSubscription(sub: Stripe.Subscription) {
  // Retrouve le user via stripeCustomerId
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) {
    console.warn(`Subscription ${sub.id} : user introuvable pour customer ${customerId}`);
    return;
  }

  const firstItem = sub.items.data[0];
  const stripePriceId = firstItem?.price.id ?? null;

  // Récupère le produit Pairs via metadata si présent.
  let productId: string | null = null;
  const productData = firstItem?.price.product;
  if (typeof productData === "object" && productData && "metadata" in productData) {
    productId = (productData.metadata?.productId as string | undefined) ?? null;
  }

  // current_period_end est sur les items dans les versions récentes du SDK,
  // mais reste accessible au niveau racine sur la subscription. On lit de façon défensive.
  const periodEnd =
    (sub as Stripe.Subscription & { current_period_end?: number }).current_period_end ??
    firstItem?.current_period_end ??
    null;

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: sub.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: sub.id,
      stripePriceId,
      productId,
      status: sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null
    },
    update: {
      status: sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      stripePriceId
    }
  });
}
