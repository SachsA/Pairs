import { Button, Section, Text } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pairs.fr";

export interface AccountWelcomeEmailProps {
  firstName?: string;
}

export function AccountWelcomeEmail({ firstName }: AccountWelcomeEmailProps) {
  return (
    <BaseLayout preview="Votre compte Pairs est prêt.">
      <Text className="m-0 font-serif text-3xl text-ink">
        Bienvenue{firstName ? `, ${firstName}` : ""}.
      </Text>
      <Text className="mt-3 leading-relaxed text-ink/70">
        Votre compte Pairs est créé. Vous pouvez désormais suivre vos commandes, gérer votre abonnement
        et accéder à votre rituel personnalisé.
      </Text>

      <Text className="mt-5 leading-relaxed text-ink/70">
        Si vous ne l'avez pas encore fait, prenez deux minutes pour notre diagnostic : nous vous recommandons
        les compléments les plus adaptés à votre cycle et à vos objectifs.
      </Text>

      <Section className="mt-8 text-center">
        <Button
          href={`${SITE_URL}/quiz`}
          className="rounded-full bg-sage-700 px-8 py-3 text-xs uppercase tracking-[0.18em] text-cream-50"
        >
          Faire le diagnostic
        </Button>
      </Section>

      <Text className="mt-8 text-xs text-ink/50">
        Une question ? Répondez simplement à cet email — nous lisons tout.
      </Text>
    </BaseLayout>
  );
}

export default AccountWelcomeEmail;
