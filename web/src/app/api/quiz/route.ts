import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
  return NextResponse.json({ ok: true });
}
