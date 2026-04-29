import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().email() });

function generatePromoCode(): string {
  return "BIENVENUE10-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(req: Request) {
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
  return NextResponse.json({ ok: true, promoCode });
}
