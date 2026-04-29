"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      await signIn("credentials", { email, password, redirect: false });
      router.push("/account");
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Erreur");
      setLoading(false);
    }
  };

  return (
    <div className="container-x mx-auto max-w-md py-20">
      <p className="eyebrow">Créer un compte</p>
      <h1 className="h-display mt-2">Bienvenue chez Pairs.</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Prénom"
          className="w-full rounded-full border border-ink/20 bg-transparent px-5 py-3 text-sm focus:border-sage-700 focus:outline-none"
        />
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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe (8 caractères min)"
          className="w-full rounded-full border border-ink/20 bg-transparent px-5 py-3 text-sm focus:border-sage-700 focus:outline-none"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Création…" : "Créer mon compte"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
      <p className="mt-6 text-sm text-ink/60">
        Déjà un compte ?{" "}
        <Link href="/login" className="underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
