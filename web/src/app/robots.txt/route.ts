/**
 * robots.txt dynamique :
 *  - Si SITE_LOCK=1 (mode construction), on bloque tous les robots.
 *  - Sinon, on autorise l'indexation.
 *
 * La ligne `Sitemap:` sera ajoutée en même temps que le sitemap lui-même
 * (tâche 52 de la roadmap) : annoncer un sitemap inexistant renvoie un 404
 * aux moteurs de recherche.
 */
export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  const locked = process.env.SITE_LOCK === "1";
  const body = locked
    ? "User-agent: *\nDisallow: /\n"
    : "User-agent: *\nAllow: /\n";
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
