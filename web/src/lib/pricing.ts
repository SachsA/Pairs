/**
 * Logique de calcul de prix côté serveur.
 * Les valeurs côté client (panier zustand) sont indicatives — c'est CETTE fonction
 * qui fait foi au moment du checkout.
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 4000; // 40,00 €
export const SHIPPING_COST_CENTS = 490;            // 4,90 €

export interface PriceLine {
  unitCents: number;
  quantity: number;
  isSubscription: boolean;
}

export function computeShippingCents(subtotalCents: number, hasSubscription: boolean): number {
  // Si le panier contient un abonnement, Stripe gérera le shipping différemment.
  // On retourne 0 ici pour ne pas le facturer en plus du Subscription mode.
  if (hasSubscription) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_COST_CENTS;
}

export function computeSubtotalCents(lines: PriceLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitCents * l.quantity, 0);
}

export function hasAnySubscription(lines: { isSubscription: boolean }[]): boolean {
  return lines.some((l) => l.isSubscription);
}
