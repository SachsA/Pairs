"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { useEffect, useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const count = useCart((s) => s.count());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream-50/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden gap-8 text-sm md:flex">
          <Link href="/products" className="hover:text-sage-700">
            Produits
          </Link>
          <Link href="/quiz" className="hover:text-sage-700">
            Diagnostic
          </Link>
          <Link href="/about" className="hover:text-sage-700">
            Qui sommes-nous
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <Link href="/account" className="hidden sm:inline hover:text-sage-700">
                {session.user.name ?? session.user.email}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-ink/60 hover:text-ink"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-sage-700">
                Connexion
              </Link>
              <Link href="/register" className="hidden sm:inline hover:text-sage-700">
                Compte
              </Link>
            </>
          )}
          <Link
            href="/cart"
            className="relative rounded-full border border-ink/20 px-4 py-2 hover:border-ink"
          >
            Panier {hydrated && count > 0 ? `(${count})` : ""}
          </Link>
        </div>
      </div>
    </header>
  );
}
