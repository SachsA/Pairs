import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind
} from "@react-email/components";
import type { ReactNode } from "react";

interface BaseLayoutProps {
  preview: string;
  children: ReactNode;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pairs.fr";

/**
 * Layout commun à tous les emails Pairs.
 * Palette : sage (vert sauge) + crème + ink.
 * Logo : SVG inline (pas d'image hébergée à maintenir).
 */
export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                cream: { 50: "#FBF8F3", 100: "#F6F1E8" },
                sage: { 100: "#E1E7DB", 700: "#444E39", 800: "#363E2E" },
                ink: "#1F1B16"
              }
            }
          }
        }}
      >
        <Body className="bg-cream-50 font-sans text-ink">
          <Container className="mx-auto my-10 max-w-[560px] rounded-2xl bg-cream-50 p-0">
            {/* Header */}
            <Section className="rounded-t-2xl bg-sage-700 px-10 py-8 text-center">
              <Img
                src={`${SITE_URL}/favicon.svg`}
                alt="Pairs"
                width="44"
                height="44"
                className="mx-auto"
              />
              <Text className="m-0 mt-3 font-serif text-2xl text-cream-50">Pairs</Text>
            </Section>

            {/* Contenu */}
            <Section className="px-10 py-10">{children}</Section>

            <Hr className="mx-10 my-0 border-ink/10" />

            {/* Footer */}
            <Section className="px-10 py-6 text-center">
              <Text className="m-0 text-xs text-ink/50">
                Pairs · Compléments alimentaires premium pour les femmes
              </Text>
              <Text className="m-0 mt-2 text-xs text-ink/40">
                <Link href={SITE_URL} className="text-ink/40 underline">
                  Visiter le site
                </Link>
                {"  ·  "}
                <Link href={`${SITE_URL}/about`} className="text-ink/40 underline">
                  Qui sommes-nous
                </Link>
              </Text>
              <Text className="m-0 mt-3 text-[10px] text-ink/30">
                Vous recevez cet email parce que vous êtes en lien avec un service Pairs.
                Pour ne plus en recevoir, répondez avec « STOP ».
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
