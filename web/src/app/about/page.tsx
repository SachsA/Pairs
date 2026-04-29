import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Qui sommes-nous" };

export default function AboutPage() {
  return (
    <div>
      <section className="bg-cream-100">
        <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Notre histoire</p>
            <h1 className="h-display mt-3">Pairs, par et pour les femmes.</h1>
            <p className="mt-6 max-w-md text-lg text-ink/70">
              Nous croyons qu'un complément alimentaire ne devrait jamais être un compromis.
              Pairs naît du constat qu'aujourd'hui encore, peu de marques formulent à hauteur des besoins
              physiologiques réels des femmes.
            </p>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1532009324734-20a7a5813719?auto=format&fit=crop&w=1400&q=80"
              alt="L'équipe Pairs"
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="grid gap-12 lg:grid-cols-3">
          <div>
            <p className="eyebrow">Conviction</p>
            <h3 className="mt-3 font-serif text-2xl">Le juste dosage</h3>
            <p className="mt-3 text-ink/70">
              Nos formules respectent les seuils d'efficacité documentés par la recherche scientifique. Pas de poudre de perlimpinpin.
            </p>
          </div>
          <div>
            <p className="eyebrow">Conviction</p>
            <h3 className="mt-3 font-serif text-2xl">Une cure, un objectif</h3>
            <p className="mt-3 text-ink/70">
              Plutôt qu'un comprimé multi-fonctions à l'efficacité diluée, des cures ciblées : cycle, sommeil, énergie, peau, hormones.
            </p>
          </div>
          <div>
            <p className="eyebrow">Conviction</p>
            <h3 className="mt-3 font-serif text-2xl">Transparence radicale</h3>
            <p className="mt-3 text-ink/70">
              Origine, fournisseur, dosage : tout est lisible sur chaque fiche produit. Vous savez ce que vous prenez.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-sage-700 text-cream-50">
        <div className="container-x grid gap-10 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow text-sage-200">L'équipe</p>
            <h2 className="font-serif text-4xl">Trois associés, une obsession.</h2>
            <p className="mt-5 max-w-md text-cream-100/80">
              Une co-fondatrice issue de la recherche en nutrition féminine, un co-fondateur ingénieur produit,
              et une responsable formulation passée par les plus grandes maisons de la cosmétique premium.
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            <li className="rounded-2xl bg-sage-800/50 p-5">
              <p className="font-serif text-xl">Camille</p>
              <p className="mt-1 text-cream-100/70">Fondatrice — formulation & R&D</p>
            </li>
            <li className="rounded-2xl bg-sage-800/50 p-5">
              <p className="font-serif text-xl">Théo</p>
              <p className="mt-1 text-cream-100/70">Co-fondateur — produit & opérations</p>
            </li>
            <li className="rounded-2xl bg-sage-800/50 p-5">
              <p className="font-serif text-xl">Inès</p>
              <p className="mt-1 text-cream-100/70">Responsable formulation</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="container-x py-20 text-center">
        <h2 className="h-display">Une formule juste, pour vous.</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink/70">
          Découvrez nos rituels ou laissez-vous guider par notre diagnostic personnalisé.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn-primary">Voir les produits</Link>
          <Link href="/quiz" className="btn-outline">Faire le diagnostic</Link>
        </div>
      </section>
    </div>
  );
}
