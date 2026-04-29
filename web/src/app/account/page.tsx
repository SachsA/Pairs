import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } }
      }
    }
  });

  return (
    <div className="container-x py-16">
      <p className="eyebrow">Mon compte</p>
      <h1 className="h-display mt-2">Bonjour {user?.name ?? user?.email} 👋</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div>
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
                    #{o.id.slice(0, 8)} · {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-sm font-medium">{formatPrice(o.totalCents)}</span>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-ink/70">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity} × {i.product.name}
                      {i.isSubscription ? " (abo)" : ""}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <aside className="h-fit rounded-2xl bg-cream-100 p-6 text-sm">
          <h3 className="font-serif text-xl">Informations</h3>
          <p className="mt-3 text-ink/70">{user?.email}</p>
          <p className="mt-1 text-ink/70">{user?.name ?? "Pas de nom renseigné"}</p>
        </aside>
      </div>
    </div>
  );
}
