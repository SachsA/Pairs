import { NextResponse, type NextRequest } from "next/server";

/**
 * DEV gate : bloque l'accès au site quand SITE_LOCK=1.
 * Le visiteur est redirigé vers /dev-login s'il n'a pas le cookie valide.
 *
 * Sécurité :
 *   - Le cookie stocke un HMAC du mot de passe (impossible à forger sans connaître SITE_LOCK_PASSWORD).
 *   - HttpOnly + SameSite=Lax + Secure en prod.
 *   - Durée de vie : 30 jours, glissante.
 *
 * Pour désactiver le gate : SITE_LOCK=0 (ou retirer la variable).
 */

const PUBLIC_PATHS = [
  "/dev-login",
  "/api/dev-login",
  "/api/health",
  "/api/stripe/webhook",
  "/favicon.svg",
  "/robots.txt",
  "/sitemap.xml"
];

// Le middleware tourne sur l'edge runtime : pas d'accès à node:crypto.
// On utilise la Web Crypto API pour HMAC-SHA256.
async function hmac(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

export async function middleware(req: NextRequest) {
  if (process.env.SITE_LOCK !== "1") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // Laisse passer les assets Next, _next, public, et chemins explicitement publics.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const password = process.env.SITE_LOCK_PASSWORD ?? "";
  const secret = process.env.NEXTAUTH_SECRET ?? "default-secret";
  const expected = await hmac(secret, password);

  const cookie = req.cookies.get("pairs_devgate")?.value;
  if (cookie === expected) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/dev-login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Match tout sauf les fichiers statiques de Next.
  matcher: ["/((?!_next/static|_next/image|favicon.svg|robots.txt).*)"]
};
