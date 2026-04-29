import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

const categories = [
  { key: "all", label: "Tous" },
  { key: "cycle", label: "Cycle" },
  { key: "energy", label: "Énergie" },
  { key: "sleep", label: "Sommeil" },
  { key: "skin", label: "Peau" },
  { key: "immunity", label: "Immunité" },
  { key: "hormones", label: "Hormones" }
];

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category;
  const products = await prisma.product.findMany({
    where: category && category !== "all" ? { category } : undefined,
    orderBy: { featured: "desc" }
  });

  return (
    <div className="container-x py-16">
      <p className="eyebrow">Boutique</p>
      <h1 className="h-display mt-2">Tous les produits</h1>
      <p className="mt-4 max-w-xl text-ink/70">
        Des formules dosées au juste, pour chaque besoin du quotidien féminin.
      </p>

      <div className="mt-10 flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = (category ?? "all") === c.key;
          return (
            <Link
              key={c.key}
              href={c.key === "all" ? "/products" : `/products?category=${c.key}`}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition ${
                active
                  ? "border-sage-700 bg-sage-700 text-cream-50"
                  : "border-ink/20 hover:border-ink"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-12 text-ink/60">Aucun produit dans cette catégorie.</p>
      )}
    </div>
  );
}
