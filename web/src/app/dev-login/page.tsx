import type { Metadata } from "next";
import { DevLoginForm } from "./form";

export const metadata: Metadata = {
  title: "Site en construction",
  robots: { index: false, follow: false }
};

export default function DevLoginPage({
  searchParams
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-cream-50 p-10 shadow-sm">
        <p className="eyebrow text-sage-700">Pairs</p>
        <h1 className="mt-2 font-serif text-3xl">Site en construction</h1>
        <p className="mt-3 text-sm text-ink/70">
          Cette plateforme est en cours de développement et n'est pas encore accessible au public.
          Si vous y êtes invité, entrez le mot de passe d'accès.
        </p>
        <DevLoginForm next={searchParams.next} error={searchParams.error} />
      </div>
    </div>
  );
}
