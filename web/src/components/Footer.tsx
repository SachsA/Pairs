import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-cream-100">
      <div className="container-x grid gap-10 py-16 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink/70">
            Compléments alimentaires premium, formulés pour les femmes, ajustés au cycle et aux objectifs.
          </p>
        </div>
        <div>
          <h4 className="eyebrow mb-3">Boutique</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-sage-700">Tous les produits</Link></li>
            <li><Link href="/products?category=cycle" className="hover:text-sage-700">Cycle</Link></li>
            <li><Link href="/products?category=energy" className="hover:text-sage-700">Énergie</Link></li>
            <li><Link href="/products?category=sleep" className="hover:text-sage-700">Sommeil</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-3">Marque</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-sage-700">Qui sommes-nous</Link></li>
            <li><Link href="/quiz" className="hover:text-sage-700">Diagnostic personnalisé</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-3">Compte</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/login" className="hover:text-sage-700">Connexion</Link></li>
            <li><Link href="/register" className="hover:text-sage-700">Créer un compte</Link></li>
            <li><Link href="/cart" className="hover:text-sage-700">Panier</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="container-x py-6 text-xs text-ink/50">
          © {new Date().getFullYear()} Pairs. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
