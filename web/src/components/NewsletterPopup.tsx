"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pairs-newsletter-popup-dismissed";

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [promoCode, setPromoCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = window.setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setPromoCode(data.promoCode);
      setStatus("done");
    } catch (err) {
      setStatus("error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-cream-50 shadow-2xl">
        <button
          onClick={close}
          aria-label="Fermer"
          className="absolute right-4 top-4 text-ink/50 hover:text-ink"
        >
          ×
        </button>
        <div className="grid md:grid-cols-2">
          <div className="hidden bg-sage-700 md:block">
            <div className="flex h-full flex-col justify-end p-8 text-cream-50">
              <p className="eyebrow text-cream-100">Bienvenue chez Pairs</p>
              <p className="font-serif text-3xl leading-tight">10% offerts sur votre 1ère commande.</p>
            </div>
          </div>
          <div className="p-8">
            {status !== "done" ? (
              <>
                <p className="eyebrow">Newsletter</p>
                <h3 className="mt-2 font-serif text-2xl">Recevez -10% en vous inscrivant</h3>
                <p className="mt-2 text-sm text-ink/70">
                  Conseils, lancements et offres exclusives. Désinscription en un clic.
                </p>
                <form onSubmit={submit} className="mt-5 space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full rounded-full border border-ink/20 bg-transparent px-5 py-3 text-sm focus:border-sage-700 focus:outline-none"
                  />
                  <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
                    {status === "loading" ? "Envoi…" : "Obtenir mon code -10%"}
                  </button>
                  {status === "error" && (
                    <p className="text-xs text-red-600">Une erreur est survenue. Réessayez.</p>
                  )}
                </form>
              </>
            ) : (
              <div className="py-2">
                <p className="eyebrow">Merci !</p>
                <h3 className="mt-2 font-serif text-2xl">Voici votre code promo</h3>
                <div className="my-5 rounded-xl border border-dashed border-sage-700 bg-sage-50 p-4 text-center">
                  <code className="font-mono text-lg text-sage-800">{promoCode}</code>
                </div>
                <p className="text-sm text-ink/70">
                  Utilisez-le au moment du paiement pour bénéficier de 10% de réduction sur votre première commande.
                </p>
                <button onClick={close} className="btn-outline mt-5 w-full">
                  Continuer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
