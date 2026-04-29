import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("placeholder")) return null;
  return new Stripe(key, { apiVersion: "2024-10-28.acacia" as any });
}
