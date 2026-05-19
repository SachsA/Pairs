import { Button, Hr, Row, Column, Section, Text } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pairs.fr";

export interface OrderConfirmationLine {
  name: string;
  quantity: number;
  unitCents: number;
  isSubscription: boolean;
}

export interface OrderConfirmationEmailProps {
  orderId: string;
  lines: OrderConfirmationLine[];
  totalCents: number;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(cents / 100);
}

export function OrderConfirmationEmail({
  orderId = "demo-order-id",
  lines = [],
  totalCents = 0
}: OrderConfirmationEmailProps) {
  return (
    <BaseLayout preview={`Confirmation de commande Pairs #${orderId.slice(0, 8)}`}>
      <Text className="m-0 font-serif text-3xl text-ink">Merci pour votre commande.</Text>
      <Text className="mt-3 leading-relaxed text-ink/70">
        Nous préparons votre rituel avec soin. Voici le récapitulatif de votre commande.
      </Text>

      <Section className="mt-6 rounded-xl bg-cream-100 px-5 py-4">
        <Text className="m-0 text-[10px] uppercase tracking-[0.18em] text-ink/50">
          Référence
        </Text>
        <Text className="m-0 mt-1 font-mono text-sm text-ink">#{orderId.slice(0, 8).toUpperCase()}</Text>
      </Section>

      <Section className="mt-6">
        {lines.map((line, i) => (
          <Row key={i} className="mt-3">
            <Column className="w-3/4">
              <Text className="m-0 font-serif text-base text-ink">
                {line.quantity} × {line.name}
              </Text>
              <Text className="m-0 text-xs text-ink/50">
                {line.isSubscription ? "Abonnement mensuel" : "Achat unique"}
              </Text>
            </Column>
            <Column className="text-right">
              <Text className="m-0 text-sm text-ink">
                {formatPrice(line.unitCents * line.quantity)}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr className="my-5 border-ink/10" />

      <Row>
        <Column>
          <Text className="m-0 font-serif text-lg text-ink">Total</Text>
        </Column>
        <Column className="text-right">
          <Text className="m-0 font-serif text-lg text-ink">{formatPrice(totalCents)}</Text>
        </Column>
      </Row>

      <Text className="mt-8 leading-relaxed text-ink/70">
        Vous recevrez un email de suivi dès l'expédition. Toutes nos commandes partent sous 48h ouvrées
        depuis la France.
      </Text>

      <Section className="mt-8 text-center">
        <Button
          href={`${SITE_URL}/account`}
          className="rounded-full bg-sage-700 px-8 py-3 text-xs uppercase tracking-[0.18em] text-cream-50"
        >
          Voir ma commande
        </Button>
      </Section>
    </BaseLayout>
  );
}

export default OrderConfirmationEmail;
