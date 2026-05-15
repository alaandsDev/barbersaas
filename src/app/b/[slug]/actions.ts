"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { parseBR, fmtBrTime, fmtBrShort } from "@/lib/utils";

// Janela de funcionamento padrão (a evoluir pra config por barbearia)
const OPEN_HOUR = 9;
const CLOSE_HOUR = 19;
const SLOT_MINUTES = 30;

const slotsSchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().min(1),
  professionalId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type SlotInfo = { iso: string; label: string; available: boolean };

export async function getAvailableSlots(input: z.infer<typeof slotsSchema>): Promise<SlotInfo[]> {
  const p = slotsSchema.parse(input);
  const service = await prisma.service.findFirst({
    where: { id: p.serviceId, businessId: p.businessId },
  });
  if (!service) return [];

  const dayStart = parseBR(p.date); // 00:00 BRT
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600_000);

  const [busy, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId: p.businessId,
        professionalId: p.professionalId,
        status: { in: ["SCHEDULED", "COMPLETED"] },
        startsAt: { gte: dayStart, lt: dayEnd },
      },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.timeBlock.findMany({
      where: {
        businessId: p.businessId,
        professionalId: p.professionalId,
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);
  const obstacles = [...busy, ...blocks];

  const now = new Date();
  const slots: SlotInfo[] = [];
  // dayStart é 00:00 BRT (como UTC). OPEN_HOUR e CLOSE_HOUR sao horas locais BRT.
  const start = new Date(dayStart.getTime() + OPEN_HOUR * 3600_000);
  const close = new Date(dayStart.getTime() + CLOSE_HOUR * 3600_000);

  for (let t = start.getTime(); t + service.durationMinutes * 60_000 <= close.getTime(); t += SLOT_MINUTES * 60_000) {
    const slotStart = new Date(t);
    const slotEnd = new Date(t + service.durationMinutes * 60_000);
    const inPast = slotStart.getTime() <= now.getTime();
    const overlap = obstacles.some((b) => slotStart < b.endsAt && slotEnd > b.startsAt);
    slots.push({
      iso: slotStart.toISOString(),
      label: fmtBrTime(slotStart),
      available: !inPast && !overlap,
    });
  }
  return slots;
}

const bookSchema = z.object({
  businessId: z.string().min(1),
  serviceId: z.string().min(1),
  professionalId: z.string().min(1),
  startsAt: z.string().min(1),
  customerName: z.string().min(2).max(80),
  customerPhone: z.string().min(8).max(40),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

export type BookResult = { ok: true; appointmentId: string } | { ok: false; error: string };

export async function bookPublicAppointment(input: z.infer<typeof bookSchema>): Promise<BookResult> {
  const parsed = bookSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };
  const p = parsed.data;

  const [service, professional, business] = await Promise.all([
    prisma.service.findFirst({ where: { id: p.serviceId, businessId: p.businessId, active: true } }),
    prisma.professional.findFirst({ where: { id: p.professionalId, businessId: p.businessId, active: true } }),
    prisma.business.findUnique({ where: { id: p.businessId }, include: { subscription: true } }),
  ]);
  if (!service || !professional || !business) return { ok: false, error: "Recurso indisponível" };

  // bloqueia se assinatura inativa
  const sub = business.subscription;
  const subOk = sub && (sub.status === "ACTIVE" || sub.status === "TRIALING");
  if (!subOk) return { ok: false, error: "Esta agenda está temporariamente indisponível." };

  const startsAt = new Date(p.startsAt);
  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
    return { ok: false, error: "Horário inválido" };
  }
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

  const [conflict, blocked] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        businessId: p.businessId,
        professionalId: p.professionalId,
        status: { in: ["SCHEDULED", "COMPLETED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    }),
    prisma.timeBlock.findFirst({
      where: {
        businessId: p.businessId,
        professionalId: p.professionalId,
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    }),
  ]);
  if (conflict || blocked) return { ok: false, error: "Horário não está mais disponível" };

  // upsert customer por telefone (mais comum no salão)
  const phone = p.customerPhone.replace(/\D/g, "");
  let customer = await prisma.customer.findFirst({
    where: { businessId: p.businessId, phone },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        businessId: p.businessId,
        name: p.customerName,
        phone,
        email: p.customerEmail || null,
      },
    });
  }

  const appt = await prisma.appointment.create({
    data: {
      businessId: p.businessId,
      professionalId: p.professionalId,
      serviceId: p.serviceId,
      customerId: customer.id,
      startsAt, endsAt,
      priceCents: service.priceCents,
    },
  });

  // notificação in-app pro owner
  await createNotification({
    businessId: p.businessId,
    kind: "appointment.created",
    title: "Novo agendamento",
    body: `${customer.name} agendou ${service.name} com ${professional.name} em ${fmtBrShort(startsAt)} ${fmtBrTime(startsAt)}`,
    link: "/app/agenda",
  });

  // confirmação por email (no-op se RESEND_API_KEY não setado)
  if (customer.email) {
    sendBookingConfirmation({
      to: customer.email,
      customerName: customer.name,
      businessName: business.name,
      service: service.name,
      professional: professional.name,
      when: startsAt,
      priceCents: service.priceCents,
    }).catch(() => {});
  }

  return { ok: true, appointmentId: appt.id };
}
