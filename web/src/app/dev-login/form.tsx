"use client";

import { useState } from "react";

export function DevLoginForm({ next, error }: { next?: string; error?: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      method="POST"
      action="/api/dev-login"
      onSubmit={() => setLoading(true)}
      className="mt-6 space-y-3"
    >
      <input type="hidden" name="next" value={next ?? "/"} />
      <input
        type="password"
        name="password"
        required
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe d'accès"
        className="w-full rounded-full border border-ink/20 bg-transparent px-5 py-3 text-sm focus:border-sage-700 focus:outline-none"
      />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Vérification…" : "Accéder au site"}
      </button>
      {error === "1" && (
        <p className="pt-2 text-xs text-red-600">Mot de passe incorrect.</p>
      )}
    </form>
  );
}
