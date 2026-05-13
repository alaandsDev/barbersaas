import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, planFromPriceId, mapStripeStatus } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function syncSubscription(stripeSubId: string) {
  const sub = await stripe.subscriptions.retrieve(stripeSubId);
  const businessId =
    (sub.metadata?.businessId as string | undefined) ??
    ((await prisma.subscription.findFirst({
      where: { stripeCustomerId: sub.customer as string },
    }))?.businessId);

  if (!businessId) return;

  const priceId = sub.items.data[0]?.price.id ?? null;
  await prisma.subscription.update({
    where: { businessId },
    data: {
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      plan: planFromPriceId(priceId),
      status: mapStripeStatus(sub.status),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.subscription) await syncSubscription(s.subscription as string);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.paid":
      case "invoice.payment_failed": {
        const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
        const subId =
          "subscription" in obj && obj.subscription
            ? (obj.subscription as string)
            : (obj as Stripe.Subscription).id;
        if (subId?.startsWith("sub_")) await syncSubscription(subId);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] error:", err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
