"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

  const dayStart = new Date(`${p.date}T00:00:00`);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

  const busy = await prisma.appointment.findMany({
    where: {
      businessId: p.businessId,
      professionalId: p.professionalId,
      status: { in: ["SCHEDULED", "COMPLETED"] },
      startsAt: { gte: dayStart, lt: dayEnd },
    },
    select: { startsAt: true, endsAt: true },
  });

  const now = new Date();
  const slots: SlotInfo[] = [];
  const start = new Date(dayStart); start.setHours(OPEN_HOUR, 0, 0, 0);
  const close = new Date(dayStart); close.setHours(CLOSE_HOUR, 0, 0, 0);

  for (let t = start.getTime(); t + service.durationMinutes * 60_000 <= close.getTime(); t += SLOT_MINUTES * 60_000) {
    const slotStart = new Date(t);
    const slotEnd = new Date(t + service.durationMinutes * 60_000);
    const inPast = slotStart.getTime() <= now.getTime();
    const overlap = busy.some((b) => slotStart < b.endsAt && slotEnd > b.startsAt);
    slots.push({
      iso: slotStart.toISOString(),
      label: slotStart.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
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

  const conflict = await prisma.appointment.findFirst({
    where: {
      businessId: p.businessId,
      professionalId: p.professionalId,
      status: { in: ["SCHEDULED", "COMPLETED"] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (conflict) return { ok: false, error: "Horário não está mais disponível" };

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

  return { ok: true, appointmentId: appt.id };
}
