import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    take: 3,
    orderBy: { createdAt: "asc" }
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream-100">
        <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="eyebrow">Compléments alimentaires premium</p>
            <h1 className="h-display mt-4">
              Une formule juste,<br />
              pour chaque phase.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink/70">
              Pairs conçoit des compléments alimentaires haut de gamme pour les femmes,
              avec des dosages cliniques alignés sur le cycle menstruel et les objectifs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Découvrir les produits
              </Link>
              <Link href="/quiz" className="btn-outline">
                Faire le diagnostic
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-xs uppercase tracking-widest text-ink/60">
              <span>Sans additifs</span>
              <span>Fabriqué en France</span>
              <span>Testé en lab</span>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=80"
              alt="Compléments Pairs"
              fill
              priority
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-x py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Best-sellers</p>
            <h2 className="h-display mt-2">Nos rituels signatures</h2>
          </div>
          <Link href="/products" className="hidden text-sm underline-offset-4 hover:underline md:inline">
            Tous les produits →
          </Link>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-sage-700 text-cream-50">
        <div className="container-x grid gap-10 py-20 md:grid-cols-3">
          <div>
            <p className="eyebrow text-sage-200">01</p>
            <h3 className="mt-3 font-serif text-2xl">Dosages cliniques</h3>
            <p className="mt-3 text-sm text-cream-100/80">
              Chaque ingrédient est dosé à hauteur de l'efficacité documentée par la recherche.
            </p>
          </div>
          <div>
            <p className="eyebrow text-sage-200">02</p>
            <h3 className="mt-3 font-serif text-2xl">Cycle féminin</h3>
            <p className="mt-3 text-sm text-cream-100/80">
              Des formules pensées pour les variations hormonales, du cycle menstruel à la périménopause.
            </p>
          </div>
          <div>
            <p className="eyebrow text-sage-200">03</p>
            <h3 className="mt-3 font-serif text-2xl">Packaging premium</h3>
            <p className="mt-3 text-sm text-cream-100/80">
              Verre ambré et carton recyclé. Le luxe, sans compromis sur la planète.
            </p>
          </div>
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="container-x py-24 text-center">
        <p className="eyebrow">Diagnostic gratuit</p>
        <h2 className="h-display mt-3">Trouvez votre rituel en 2 minutes</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink/70">
          Quelques questions sur votre cycle et vos objectifs : nous vous recommandons les compléments les plus adaptés.
        </p>
        <Link href="/quiz" className="btn-primary mt-8">
          Démarrer le diagnostic
        </Link>
      </section>
    </div>
  );
}
