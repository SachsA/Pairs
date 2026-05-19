import { Button, Section, Text } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pairs.fr";

export interface QuizResultsEmailProps {
  recommendations: { slug: string; name: string }[];
}

export function QuizResultsEmail({
  recommendations = []
}: QuizResultsEmailProps) {
  return (
    <BaseLayout preview="Votre rituel Pairs personnalisé">
      <Text className="m-0 font-serif text-3xl text-ink">Votre rituel personnalisé.</Text>
      <Text className="mt-3 leading-relaxed text-ink/70">
        Voici les compléments que nous vous recommandons en priorité, d'après les réponses à votre diagnostic.
      </Text>

      <Section className="mt-6">
        {recommendations.map((r, i) => (
          <Section
            key={r.slug}
            className="mt-3 rounded-xl border border-ink/10 bg-cream-100 px-5 py-4"
          >
            <Text className="m-0 text-[10px] uppercase tracking-[0.18em] text-ink/50">
              Recommandation {i + 1}
            </Text>
            <Text className="m-0 mt-1 font-serif text-xl text-ink">{r.name}</Text>
            <Text className="m-0 mt-2 text-xs">
              <a
                href={`${SITE_URL}/products/${r.slug}`}
                style={{ color: "#444E39", textDecoration: "underline" }}
              >
                Découvrir →
              </a>
            </Text>
          </Section>
        ))}
      </Section>

      <Text className="mt-8 leading-relaxed text-ink/70">
        Ces recommandations sont indicatives. En cas de doute, parlez-en à votre médecin
        ou à votre sage-femme avant de commencer une cure.
      </Text>

      <Section className="mt-8 text-center">
        <Button
          href={`${SITE_URL}/products`}
          className="rounded-full bg-sage-700 px-8 py-3 text-xs uppercase tracking-[0.18em] text-cream-50"
        >
          Voir tous les produits
        </Button>
      </Section>
    </BaseLayout>
  );
}

export default QuizResultsEmail;
