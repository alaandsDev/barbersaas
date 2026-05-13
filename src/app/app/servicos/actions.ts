"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  priceBRL: z.coerce.number().min(0),
  durationMinutes: z.coerce.number().int().min(5).max(480),
});

export async function createService(formData: FormData) {
  const ctx = await requireTenant();
  const p = schema.parse({
    name: formData.get("name"),
    priceBRL: formData.get("priceBRL"),
    durationMinutes: formData.get("durationMinutes"),
  });
  await prisma.service.create({
    data: {
      businessId: ctx.businessId,
      name: p.name,
      priceCents: Math.round(p.priceBRL * 100),
      durationMinutes: p.durationMinutes,
    },
  });
  revalidatePath("/app/servicos");
}

export async function deleteService(formData: FormData) {
  const ctx = await requireTenant();
  const id = String(formData.get("id"));
  await prisma.service.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath("/app/servicos");
}
