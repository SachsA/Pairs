import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { AddToCart } from "@/components/AddToCart";
import { Stars } from "@/components/Stars";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { ingredients: true, reviews: { orderBy: { createdAt: "desc" } } }
  });

  if (!product) notFound();

  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <div className="container-x py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <p className="eyebrow capitalize">{product.category}</p>
          <h1 className="h-display mt-2">{product.name}</h1>
          <p className="mt-3 text-lg text-ink/70">{product.tagline}</p>

          {product.reviews.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-ink/60">
              <Stars rating={avg} />
              <span>
                {avg.toFixed(1)} · {product.reviews.length} avis
              </span>
            </div>
          )}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-3xl">{formatPrice(product.priceCents)}</span>
            {product.subscriptionPriceCents && (
              <span className="text-sm text-sage-700">
                ou {formatPrice(product.subscriptionPriceCents)} en abonnement
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-8">
            <AddToCart product={product} />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl bg-cream-100 p-5 text-sm">
            <div>
              <dt className="text-ink/50">Format</dt>
              <dd className="mt-1 font-medium">{product.capsules} gélules</dd>
            </div>
            <div>
              <dt className="text-ink/50">Posologie</dt>
              <dd className="mt-1 font-medium">{product.servingSize}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Composition */}
      <section className="mt-20">
        <p className="eyebrow">Composition</p>
        <h2 className="h-display mt-2">Chaque ingrédient compte.</h2>
        <div className="mt-10 overflow-hidden rounded-2xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-widest text-ink/60">
              <tr>
                <th className="px-6 py-4">Ingrédient</th>
                <th className="px-6 py-4">Dosage</th>
                <th className="px-6 py-4">Bénéfice</th>
              </tr>
            </thead>
            <tbody>
              {product.ingredients.map((i) => (
                <tr key={i.id} className="border-t border-ink/10">
                  <td className="px-6 py-4 font-medium">{i.name}</td>
                  <td className="px-6 py-4 text-ink/70">{i.dosage}</td>
                  <td className="px-6 py-4 text-ink/70">{i.benefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-20">
        <p className="eyebrow">Avis clientes</p>
        <h2 className="h-display mt-2">
          {product.reviews.length} avis · {avg.toFixed(1)}/5
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {product.reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-ink/10 bg-cream-50 p-6">
              <div className="flex items-center justify-between">
                <Stars rating={r.rating} />
                <span className="text-xs text-ink/50">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <h3 className="mt-3 font-serif text-xl">{r.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{r.body}</p>
              <p className="mt-4 text-xs uppercase tracking-widest text-ink/50">{r.authorName}</p>
            </article>
          ))}
          {product.reviews.length === 0 && (
            <p className="text-ink/60">Soyez la première à laisser un avis.</p>
          )}
        </div>
      </section>
    </div>
  );
}
