"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";
import { parseBR } from "@/lib/utils";

const schema = z.object({
  professionalId: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  reason: z.string().max(120).optional(),
});

export async function createTimeBlock(formData: FormData) {
  const ctx = await requireTenant();
  const p = schema.parse({
    professionalId: formData.get("professionalId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    reason: (formData.get("reason") as string) || undefined,
  });
  const startsAt = parseBR(p.startsAt);
  const endsAt = parseBR(p.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    throw new Error("Intervalo inválido");
  }
  const pro = await prisma.professional.findFirst({ where: { id: p.professionalId, businessId: ctx.businessId } });
  if (!pro) throw new Error("Profissional inválido");
  await prisma.timeBlock.create({
    data: { businessId: ctx.businessId, professionalId: p.professionalId, startsAt, endsAt, reason: p.reason },
  });
  revalidatePath("/app/bloqueios");
  revalidatePath("/app/agenda");
}

export async function deleteTimeBlock(formData: FormData) {
  const ctx = await requireTenant();
  const id = String(formData.get("id"));
  await prisma.timeBlock.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath("/app/bloqueios");
  revalidatePath("/app/agenda");
}
