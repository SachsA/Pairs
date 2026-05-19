import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint utilisé par Docker healthcheck et reverse-proxy.
 * Réponse minimaliste pour éviter d'embarquer Prisma sur ce chemin chaud.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
}
