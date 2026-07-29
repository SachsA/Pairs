"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * `useSearchParams` force le rendu côté client. Ce composant doit donc être
 * enveloppé dans un <Suspense> par la page, sinon le prerendering échoue au
 * build (« useSearchParams should be wrapped in a suspense boundary »).
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-full border border-ink/20 bg-transparent px-5 py-3 text-sm focus:border-sage-700 focus:outline-none"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full rounded-full border border-ink/20 bg-transparent px-5 py-3 text-sm focus:border-sage-700 focus:outline-none"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
      <p className="mt-6 text-sm text-ink/60">
        Pas encore de compte ?{" "}
        <Link href="/register" className="underline">
          Créer un compte
        </Link>
      </p>
    </>
  );
}
