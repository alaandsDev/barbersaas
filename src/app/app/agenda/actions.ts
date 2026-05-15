"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { parseBR, fmtBrShort, fmtBrTime } from "@/lib/utils";

const createSchema = z.object({
  professionalId: z.string().min(1),
  serviceId: z.string().min(1),
  customerId: z.string().min(1),
  startsAt: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createAppointment(formData: FormData): Promise<ActionResult> {
  const ctx = await requireTenant();
  const parsed = createSchema.safeParse({
    professionalId: formData.get("professionalId"),
    serviceId: formData.get("serviceId"),
    customerId: formData.get("customerId"),
    startsAt: formData.get("startsAt"),
    notes: (formData.get("notes") as string) || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };
  const p = parsed.data;

  // Validar pertencimento ao tenant
  const [service, professional, customer] = await Promise.all([
    prisma.service.findFirst({ where: { id: p.serviceId, businessId: ctx.businessId } }),
    prisma.professional.findFirst({ where: { id: p.professionalId, businessId: ctx.businessId } }),
    prisma.customer.findFirst({ where: { id: p.customerId, businessId: ctx.businessId } }),
  ]);
  if (!service || !professional || !customer) return { ok: false, error: "Recurso inválido" };

  const startsAt = parseBR(p.startsAt);
  if (Number.isNaN(startsAt.getTime())) return { ok: false, error: "Data inválida" };
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

  // Checagem de conflito: mesma profissional, intervalo sobreposto, não cancelado
  const conflict = await prisma.appointment.findFirst({
    where: {
      businessId: ctx.businessId,
      professionalId: p.professionalId,
      status: { in: ["SCHEDULED", "COMPLETED"] },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (conflict) return { ok: false, error: "Conflito de horário para esse profissional" };

  // Bloqueios (folga, almoço)
  const blocked = await prisma.timeBlock.findFirst({
    where: {
      businessId: ctx.businessId,
      professionalId: p.professionalId,
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (blocked) return { ok: false, error: "Profissional indisponível nesse horário (bloqueio ativo)" };

  await prisma.appointment.create({
    data: {
      businessId: ctx.businessId,
      professionalId: p.professionalId,
      serviceId: p.serviceId,
      customerId: p.customerId,
      startsAt, endsAt,
      priceCents: service.priceCents,
      notes: p.notes,
    },
  });
  await createNotification({
    businessId: ctx.businessId,
    kind: "appointment.created",
    title: "Novo agendamento",
    body: `${customer.name} · ${service.name} com ${professional.name} em ${fmtBrShort(startsAt)} ${fmtBrTime(startsAt)}`,
    link: "/app/agenda",
  });
  revalidatePath("/app/agenda");
  revalidatePath("/app");
  return { ok: true };
}

export async function setAppointmentStatus(formData: FormData) {
  const ctx = await requireTenant();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  if (!["SCHEDULED", "COMPLETED", "CANCELED", "NO_SHOW"].includes(status)) return;
  await prisma.appointment.updateMany({
    where: { id, businessId: ctx.businessId },
    data: { status },
  });
  revalidatePath("/app/agenda");
  revalidatePath("/app");
}

const updateSchema = z.object({
  id: z.string().min(1),
  professionalId: z.string().min(1),
  serviceId: z.string().min(1),
  startsAt: z.string().min(1),
});

export async function updateAppointment(formData: FormData): Promise<ActionResult> {
  const ctx = await requireTenant();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    professionalId: formData.get("professionalId"),
    serviceId: formData.get("serviceId"),
    startsAt: formData.get("startsAt"),
  });
  if (!parsed.success) return { ok: false, error: "Dados inválidos" };
  const p = parsed.data;

  const [appt, service, professional] = await Promise.all([
    prisma.appointment.findFirst({ where: { id: p.id, businessId: ctx.businessId } }),
    prisma.service.findFirst({ where: { id: p.serviceId, businessId: ctx.businessId } }),
    prisma.professional.findFirst({ where: { id: p.professionalId, businessId: ctx.businessId } }),
  ]);
  if (!appt || !service || !professional) return { ok: false, error: "Recurso inválido" };

  const startsAt = parseBR(p.startsAt);
  if (Number.isNaN(startsAt.getTime())) return { ok: false, error: "Data inválida" };
  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      businessId: ctx.businessId,
      professionalId: p.professionalId,
      status: { in: ["SCHEDULED", "COMPLETED"] },
      id: { not: p.id },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (conflict) return { ok: false, error: "Conflito de horário" };

  const blocked = await prisma.timeBlock.findFirst({
    where: {
      businessId: ctx.businessId,
      professionalId: p.professionalId,
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  if (blocked) return { ok: false, error: "Profissional indisponível (bloqueio)" };

  await prisma.appointment.update({
    where: { id: p.id },
    data: {
      professionalId: p.professionalId,
      serviceId: p.serviceId,
      startsAt, endsAt,
      priceCents: service.priceCents,
    },
  });
  revalidatePath("/app/agenda");
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteAppointment(formData: FormData) {
  const ctx = await requireTenant();
  const id = String(formData.get("id"));
  await prisma.appointment.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath("/app/agenda");
}
