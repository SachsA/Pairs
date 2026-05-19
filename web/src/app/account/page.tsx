import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  trialing: "Essai",
  past_due: "Paiement en retard",
  canceled: "Annulé",
  unpaid: "Impayé",
  incomplete: "Incomplet"
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  failed: "Échouée",
  canceled: "Annulée"
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } }
      },
      subscriptions: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const activeSubs = user?.subscriptions.filter((s) =>
    ["active", "trialing", "past_due"].includes(s.status)
  ) ?? [];

  return (
    <div className="container-x py-16">
      <p className="eyebrow">Mon compte</p>
      <h1 className="h-display mt-2">Bonjour {user?.name ?? user?.email}</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-12">
          {/* Abonnements */}
          {activeSubs.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl">Mes abonnements</h2>
              <ul className="mt-6 space-y-4">
                {activeSubs.map((s) => (
                  <li key={s.id} className="rounded-2xl border border-ink/10 bg-cream-50 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-sage-700">
                        {STATUS_LABEL[s.status] ?? s.status}
                      </span>
                      {s.currentPeriodEnd && (
                        <span className="text-xs text-ink/50">
                          {s.cancelAtPeriodEnd
                            ? `Se termine le ${new Date(s.currentPeriodEnd).toLocaleDateString("fr-FR")}`
                            : `Prochain prélèvement le ${new Date(s.currentPeriodEnd).toLocaleDateString("fr-FR")}`}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
                      Réf. {s.stripeSubscriptionId.slice(0, 14)}…
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Commandes */}
          <section>
            <h2 className="font-serif text-2xl">Mes commandes</h2>
            {user?.orders.length === 0 && (
              <p className="mt-4 text-ink/60">
                Aucune commande pour l'instant.{" "}
                <Link href="/products" className="underline">
                  Découvrir les produits
                </Link>
              </p>
            )}
            <ul className="mt-6 space-y-4">
              {user?.orders.map((o) => (
                <li key={o.id} className="rounded-2xl border border-ink/10 bg-cream-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-ink/50">
                      #{o.id.slice(0, 8).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="text-sm font-medium">{formatPrice(o.totalCents)}</span>
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-sage-700">
                    {ORDER_STATUS_LABEL[o.status] ?? o.status}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-ink/70">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.quantity} × {i.product.name}
                        {i.isSubscription ? " (abonnement)" : ""}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-cream-100 p-6 text-sm">
            <h3 className="font-serif text-xl">Informations</h3>
            <p className="mt-3 text-ink/70">{user?.email}</p>
            <p className="mt-1 text-ink/70">{user?.name ?? "Pas de nom renseigné"}</p>
          </div>

          {user?.stripeCustomerId && (
            <div className="rounded-2xl bg-sage-700 p-6 text-sm text-cream-50">
              <h3 className="font-serif text-xl">Facturation</h3>
              <p className="mt-2 text-cream-100/80">
                Gérez vos abonnements, votre moyen de paiement et téléchargez vos factures sur le portail Stripe sécurisé.
              </p>
              <form action="/api/account/portal" method="POST" className="mt-4">
                <button
                  type="submit"
                  className="w-full rounded-full bg-cream-50 px-5 py-3 text-xs uppercase tracking-widest text-ink hover:bg-cream-100"
                >
                  Gérer mes abonnements
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
