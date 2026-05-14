"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(280).optional(),
  commissionPercent: z.coerce.number().int().min(0).max(100).default(50),
});

export async function createProfessional(formData: FormData) {
  const ctx = await requireTenant();
  const p = schema.parse({
    name: formData.get("name"),
    bio: (formData.get("bio") as string) || undefined,
    commissionPercent: formData.get("commissionPercent") ?? 50,
  });
  await prisma.professional.create({
    data: { businessId: ctx.businessId, name: p.name, bio: p.bio, commissionPercent: p.commissionPercent },
  });
  revalidatePath("/app/profissionais");
}

export async function updateCommission(formData: FormData) {
  const ctx = await requireTenant();
  const id = String(formData.get("id"));
  const pct = Math.max(0, Math.min(100, Math.round(Number(formData.get("commissionPercent")))));
  if (Number.isNaN(pct)) return;
  await prisma.professional.updateMany({
    where: { id, businessId: ctx.businessId },
    data: { commissionPercent: pct },
  });
  revalidatePath("/app/profissionais");
  revalidatePath("/app/financeiro");
}

export async function deleteProfessional(formData: FormData) {
  const ctx = await requireTenant();
  const id = String(formData.get("id"));
  await prisma.professional.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath("/app/profissionais");
}
