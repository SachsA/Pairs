import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./form";

export const metadata: Metadata = {
  title: "Connexion"
};

export default function LoginPage() {
  return (
    <div className="container-x mx-auto max-w-md py-20">
      <p className="eyebrow">Connexion</p>
      <h1 className="h-display mt-2">Bon retour.</h1>
      <Suspense fallback={<div className="mt-8 h-48" aria-hidden />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
