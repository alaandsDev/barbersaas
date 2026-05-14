import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingReminder } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Roda a cada hora via Vercel Cron
// Envia lembrete para appointments começando entre 1-2h à frente que ainda não receberam.
export async function GET(req: Request) {
  // Vercel Cron envia header de autorização — bloqueia chamadas externas
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60_000);
  const inTwoHours = new Date(now.getTime() + 120 * 60_000);

  const due = await prisma.appointment.findMany({
    where: {
      status: "SCHEDULED",
      reminderSentAt: null,
      startsAt: { gte: inOneHour, lt: inTwoHours },
    },
    include: {
      customer: { select: { name: true, email: true } },
      service: { select: { name: true } },
      professional: { select: { name: true } },
      business: { select: { name: true } },
    },
    take: 100,
  });

  let sent = 0, skipped = 0, failed = 0;
  for (const a of due) {
    if (!a.customer.email) { skipped++; continue; }
    const r = await sendBookingReminder({
      to: a.customer.email,
      customerName: a.customer.name,
      businessName: a.business.name,
      service: a.service.name,
      professional: a.professional.name,
      when: a.startsAt,
    });
    if ("ok" in r && r.ok) sent++;
    else if ("skipped" in r) skipped++;
    else failed++;
    // marca como enviado mesmo se sem email pra não retentar
    await prisma.appointment.update({ where: { id: a.id }, data: { reminderSentAt: new Date() } });
  }

  return NextResponse.json({ scanned: due.length, sent, skipped, failed });
}
