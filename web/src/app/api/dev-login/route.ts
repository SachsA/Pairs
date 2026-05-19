import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

function hmac(key: string, data: string): string {
  return createHmac("sha256", key).update(data).digest("hex");
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `devlogin:${ip}`, limit: 8, windowMs: 10 * 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const expected = process.env.SITE_LOCK_PASSWORD ?? "";
  const secret = process.env.NEXTAUTH_SECRET ?? "default-secret";

  const a = Buffer.from(hmac(secret, password));
  const b = Buffer.from(hmac(secret, expected));

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    const url = new URL("/dev-login", req.url);
    url.searchParams.set("error", "1");
    if (next !== "/") url.searchParams.set("next", safeNext);
    return NextResponse.redirect(url, 303);
  }

  const res = NextResponse.redirect(new URL(safeNext, req.url), 303);
  res.cookies.set("pairs_devgate", b.toString(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30 // 30 jours
  });
  return res;
}
