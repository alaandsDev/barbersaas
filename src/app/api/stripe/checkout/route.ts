import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { requireTenant, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({ plan: z.enum(["BASIC", "PRO", "PREMIUM"]) });

export async function POST(req: Request) {
  const ctx = await requireTenant();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => ({}));
  const { plan } = bodySchema.parse(json);
  const priceId = PLANS[plan as PlanKey].priceId;
  if (!priceId) return NextResponse.json({ error: "Plano não configurado" }, { status: 400 });

  const sub = await prisma.subscription.findUnique({ where: { businessId: ctx.businessId } });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let customerId = sub?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { businessId: ctx.businessId, userId: user.id },
    });
    customerId = customer.id;
    await prisma.subscription.update({
      where: { businessId: ctx.businessId },
      data: { stripeCustomerId: customerId },
    });
  }

  // Trial de 3 dias gratis em qualquer plano. Sem cartao no checkout — Stripe cancela se nao adicionar PM ate o fim.
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/app?checkout=success`,
    cancel_url: `${appUrl}/billing/required?canceled=1`,
    allow_promotion_codes: true,
    payment_method_collection: "if_required",
    subscription_data: {
      metadata: { businessId: ctx.businessId },
      trial_period_days: 3,
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
    },
    metadata: { businessId: ctx.businessId, plan },
  });

  return NextResponse.json({ url: session.url });
}
