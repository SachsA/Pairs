/**
 * robots.txt dynamique :
 *  - Si SITE_LOCK=1 (mode DEV), on bloque tous les crawlers (Disallow: /).
 *  - Sinon, on autorise tout.
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  const locked = process.env.SITE_LOCK === "1";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const body = locked
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
