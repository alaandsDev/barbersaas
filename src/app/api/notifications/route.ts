import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const ctx = await requireTenant();
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { businessId: ctx.businessId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { businessId: ctx.businessId, readAt: null } }),
  ]);
  return NextResponse.json({ items, unread });
}

export async function POST(req: Request) {
  const ctx = await requireTenant();
  const { action, id } = await req.json().catch(() => ({}));
  if (action === "mark-all-read") {
    await prisma.notification.updateMany({
      where: { businessId: ctx.businessId, readAt: null },
      data: { readAt: new Date() },
    });
  } else if (action === "mark-read" && typeof id === "string") {
    await prisma.notification.updateMany({
      where: { id, businessId: ctx.businessId, readAt: null },
      data: { readAt: new Date() },
    });
  }
  return NextResponse.json({ ok: true });
}
