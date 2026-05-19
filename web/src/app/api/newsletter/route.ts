import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmailAsync } from "@/lib/email";
import { NewsletterWelcomeEmail } from "@/emails/NewsletterWelcomeEmail";

const schema = z.object({ email: z.string().email() });

function generatePromoCode(): string {
  return "BIENVENUE10-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `newsletter:${ip}`, limit: 10, windowMs: 60 * 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: true, promoCode: existing.promoCode, alreadySubscribed: true });
  }
  const promoCode = generatePromoCode();
  await prisma.newsletterSubscriber.create({ data: { email, promoCode } });

  // Envoi email de bienvenue avec le code promo (non-bloquant)
  sendEmailAsync({
    to: email,
    subject: "Votre code -10% chez Pairs",
    react: NewsletterWelcomeEmail({ promoCode })
  });

  return NextResponse.json({ ok: true, promoCode });
}
