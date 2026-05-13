"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export async function createCustomer(formData: FormData) {
  const ctx = await requireTenant();
  const p = schema.parse({
    name: formData.get("name"),
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  });
  await prisma.customer.create({
    data: {
      businessId: ctx.businessId,
      name: p.name,
      phone: p.phone,
      email: p.email || null,
      notes: p.notes,
    },
  });
  revalidatePath("/app/clientes");
}

export async function deleteCustomer(formData: FormData) {
  const ctx = await requireTenant();
  const id = String(formData.get("id"));
  await prisma.customer.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath("/app/clientes");
}
