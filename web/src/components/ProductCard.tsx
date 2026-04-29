import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

interface Props {
  product: {
    slug: string;
    name: string;
    tagline: string;
    priceCents: number;
    subscriptionPriceCents: number | null;
    imageUrl: string;
    category: string;
  };
}

const categoryLabel: Record<string, string> = {
  cycle: "Cycle",
  energy: "Énergie",
  sleep: "Sommeil",
  skin: "Peau",
  immunity: "Immunité",
  hormones: "Hormones"
};

export function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-cream-50/90 px-3 py-1 text-[10px] uppercase tracking-widest text-ink/70">
          {categoryLabel[product.category] ?? product.category}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-ink">{product.name}</h3>
          <p className="text-sm text-ink/60">{product.tagline}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium">{formatPrice(product.priceCents)}</p>
          {product.subscriptionPriceCents && (
            <p className="text-xs text-sage-700">
              Abo {formatPrice(product.subscriptionPriceCents)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
