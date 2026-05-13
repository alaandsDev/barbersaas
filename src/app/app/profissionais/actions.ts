"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(280).optional(),
});

export async function createProfessional(formData: FormData) {
  const ctx = await requireTenant();
  const p = schema.parse({
    name: formData.get("name"),
    bio: (formData.get("bio") as string) || undefined,
  });
  await prisma.professional.create({
    data: { businessId: ctx.businessId, name: p.name, bio: p.bio },
  });
  revalidatePath("/app/profissionais");
}

export async function deleteProfessional(formData: FormData) {
  const ctx = await requireTenant();
  const id = String(formData.get("id"));
  await prisma.professional.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath("/app/profissionais");
}
