#!/usr/bin/env node
/**
 * Génère un preview HTML de chaque email dans /tmp/emails-preview/.
 * Utile pour vérifier visuellement sans envoyer un vrai email.
 *
 *   cd web && node scripts/preview-emails.mjs
 *   xdg-open /tmp/emails-preview/index.html   (Linux)
 *   open /tmp/emails-preview/index.html       (Mac)
 */
import { render } from "@react-email/render";
import { writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import React from "react";

// Rend React global pour le runtime JSX "classic" utilisé par tsx hors Next.
globalThis.React = React;

process.env.NEXT_PUBLIC_SITE_URL ??= "https://pairs.fr";

const { NewsletterWelcomeEmail } = await import("../src/emails/NewsletterWelcomeEmail.tsx");
const { AccountWelcomeEmail } = await import("../src/emails/AccountWelcomeEmail.tsx");
const { OrderConfirmationEmail } = await import("../src/emails/OrderConfirmationEmail.tsx");
const { QuizResultsEmail } = await import("../src/emails/QuizResultsEmail.tsx");

const outDir = join(tmpdir(), "emails-preview");
await mkdir(outDir, { recursive: true });

const samples = [
  ["newsletter.html", NewsletterWelcomeEmail({ promoCode: "BIENVENUE10-AB12CD" })],
  ["account.html", AccountWelcomeEmail({ firstName: "Camille" })],
  [
    "order.html",
    OrderConfirmationEmail({
      orderId: "ck1a2b3c4d5e6f",
      totalCents: 9970,
      lines: [
        { name: "Cycle Équilibré", quantity: 1, unitCents: 3490, isSubscription: false },
        { name: "Énergie Féminine", quantity: 2, unitCents: 2790, isSubscription: true }
      ]
    })
  ],
  [
    "quiz.html",
    QuizResultsEmail({
      recommendations: [
        { slug: "cycle-equilibre", name: "Cycle Équilibré" },
        { slug: "energie-feminine", name: "Énergie Féminine" },
        { slug: "sommeil-profond", name: "Sommeil Profond" }
      ]
    })
  ]
];

for (const [name, element] of samples) {
  const html = await render(element);
  await writeFile(join(outDir, name), html, "utf8");
  console.log("✓", join(outDir, name));
}

const indexHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Pairs email previews</title>
<style>body{font:14px system-ui;margin:2rem;color:#1F1B16}a{color:#444E39}</style>
</head><body>
<h1>Pairs — Email previews</h1>
<ul>${samples.map(([n]) => `<li><a href="${n}">${n}</a></li>`).join("")}</ul>
</body></html>`;
await writeFile(join(outDir, "index.html"), indexHtml);
console.log(`\nOuvrir : ${join(outDir, "index.html")}`);
