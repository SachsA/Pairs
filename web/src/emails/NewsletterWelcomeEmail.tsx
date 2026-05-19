import { Button, Section, Text } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pairs.fr";

export interface NewsletterWelcomeEmailProps {
  promoCode: string;
}

export function NewsletterWelcomeEmail({ promoCode = "BIENVENUE10-XXXXXX" }: NewsletterWelcomeEmailProps) {
  return (
    <BaseLayout preview={`Votre code -10% : ${promoCode}`}>
      <Text className="m-0 font-serif text-3xl text-ink">Bienvenue chez Pairs.</Text>
      <Text className="mt-3 leading-relaxed text-ink/70">
        Merci de rejoindre la newsletter. Voici votre code promo de bienvenue, à utiliser sur votre première commande.
      </Text>

      <Section className="my-7 rounded-xl border border-dashed border-sage-700 bg-sage-100 px-6 py-5 text-center">
        <Text className="m-0 text-[10px] uppercase tracking-[0.18em] text-ink/50">
          Votre code -10%
        </Text>
        <Text className="m-0 mt-2 font-mono text-2xl text-sage-800">{promoCode}</Text>
      </Section>

      <Text className="leading-relaxed text-ink/70">
        Une fois par mois, nous partageons nos lancements, nos conseils de cure et des offres réservées aux abonnées.
        Pas de spam : votre attention est précieuse.
      </Text>

      <Section className="mt-8 text-center">
        <Button
          href={`${SITE_URL}/products`}
          className="rounded-full bg-sage-700 px-8 py-3 text-xs uppercase tracking-[0.18em] text-cream-50"
        >
          Découvrir les produits
        </Button>
      </Section>
    </BaseLayout>
  );
}

export default NewsletterWelcomeEmail;
