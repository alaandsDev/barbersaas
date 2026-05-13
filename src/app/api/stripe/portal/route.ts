import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const ctx = await requireTenant();
  const sub = await prisma.subscription.findUnique({ where: { businessId: ctx.businessId } });
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${appUrl}/app/billing`,
  });
  return NextResponse.json({ url: portal.url });
}
