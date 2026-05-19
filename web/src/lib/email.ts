import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

/**
 * Helper unifié d'envoi d'emails transactionnels.
 *
 * Modes :
 *   - RESEND_API_KEY définie → envoi réel via Resend.
 *   - RESEND_API_KEY absente → mode "mock" : log dans la console, pas d'envoi.
 *
 * Les erreurs d'envoi sont loggées mais ne propagent JAMAIS : les flows produits
 * (inscription, commande, etc.) ne doivent pas casser à cause d'un email raté.
 */

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  react: ReactElement;
  /** Texte de fallback pour les clients qui ne lisent pas le HTML */
  text?: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  mocked?: boolean;
  error?: string;
}

const FROM = process.env.EMAIL_FROM ?? "Pairs <onboarding@resend.dev>";

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const html = await render(input.react);
    const text = input.text ?? (await render(input.react, { plainText: true }));
    const resend = getResend();

    // Mode mock (pas de clé API)
    if (!resend) {
      console.log("📧 [mock] Email non envoyé (RESEND_API_KEY absente)");
      console.log(`   To:      ${input.to}`);
      console.log(`   From:    ${FROM}`);
      console.log(`   Subject: ${input.subject}`);
      console.log(`   --- texte ---\n${text.split("\n").slice(0, 8).join("\n")}\n   ---`);
      return { ok: true, mocked: true };
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: input.subject,
      html,
      text
    });

    if (error) {
      console.error("📧 Resend a renvoyé une erreur :", error);
      return { ok: false, error: error.message ?? "Unknown Resend error" };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("📧 Échec d'envoi email :", err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Version fire-and-forget pour les routes API : déclenche l'envoi en arrière-plan
 * sans bloquer la réponse HTTP. Les erreurs sont loggées.
 */
export function sendEmailAsync(input: SendEmailInput): void {
  void sendEmail(input).catch((e) => {
    console.error("📧 sendEmailAsync error:", e);
  });
}
