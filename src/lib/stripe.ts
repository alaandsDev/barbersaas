import Stripe from "stripe";

let _stripe: Stripe | null = null;
export const stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    if (!_stripe) {
      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-02-24.acacia",
        typescript: true,
      });
    }
    return (_stripe as any)[prop];
  },
});

export type PlanKey = "BASIC" | "PRO" | "PREMIUM";

export const PLANS: Record<PlanKey, { name: string; priceBRL: string; priceId: string | undefined; features: string[]; popular?: boolean }> = {
  BASIC: {
    name: "Basic",
    priceBRL: "R$ 39,90",
    priceId: process.env.STRIPE_PRICE_BASIC,
    features: ["1 barbearia", "Até 2 profissionais", "Agenda + clientes"],
  },
  PRO: {
    name: "Pro",
    priceBRL: "R$ 59,90",
    priceId: process.env.STRIPE_PRICE_PRO,
    features: ["Profissionais ilimitados", "Dashboard financeiro", "Suporte prioritário"],
    popular: true,
  },
  PREMIUM: {
    name: "Premium",
    priceBRL: "R$ 79,90",
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    features: ["Multi-unidade", "Automações", "API access"],
  },
};

export function planFromPriceId(priceId: string | null | undefined): PlanKey {
  if (!priceId) return "BASIC";
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) return "PREMIUM";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  return "BASIC";
}

export function mapStripeStatus(s: Stripe.Subscription.Status) {
  switch (s) {
    case "active": return "ACTIVE" as const;
    case "trialing": return "TRIALING" as const;
    case "past_due": return "PAST_DUE" as const;
    case "canceled": return "CANCELED" as const;
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE" as const;
    case "unpaid":
    case "paused":
    default:
      return "INACTIVE" as const;
  }
}
