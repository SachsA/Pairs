import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmailAsync } from "@/lib/email";
import { QuizResultsEmail } from "@/emails/QuizResultsEmail";

const schema = z.object({
  email: z.string().email().optional(),
  answers: z.record(z.string()),
  recommendedSlugs: z.array(z.string())
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Réponses invalides" }, { status: 400 });
  }
  const { email, answers, recommendedSlugs } = parsed.data;
  await prisma.quizResponse.create({
    data: {
      email: email?.toLowerCase(),
      answers: JSON.stringify(answers),
      recommendedSlugs: recommendedSlugs.join(",")
    }
  });

  // Si l'utilisateur a fourni un email, on lui envoie ses recommandations.
  if (email && recommendedSlugs.length > 0) {
    const products = await prisma.product.findMany({
      where: { slug: { in: recommendedSlugs } },
      select: { slug: true, name: true }
    });
    // Conserver l'ordre des recommandations
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const ordered = recommendedSlugs
      .map((s) => bySlug.get(s))
      .filter((p): p is { slug: string; name: string } => Boolean(p));

    sendEmailAsync({
      to: email.toLowerCase(),
      subject: "Votre rituel Pairs personnalisé",
      react: QuizResultsEmail({ recommendations: ordered })
    });
  }

  return NextResponse.json({ ok: true });
}
