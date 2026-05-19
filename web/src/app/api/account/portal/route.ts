import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Crée une session du Customer Portal Stripe et redirige l'utilisateur.
 * Le portail laisse l'utilisateur :
 *  - voir/annuler ses abonnements
 *  - mettre à jour sa carte bancaire
 *  - télécharger ses factures PDF
 *
 * Activation préalable dans le dashboard Stripe :
 *   Settings → Customer portal → Activate
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Aucun compte client Stripe associé. Passez d'abord une commande." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${siteUrl}/account`
  });

  return NextResponse.redirect(portal.url, 303);
}
