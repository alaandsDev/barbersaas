"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, ensureLocalUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  phone: z.string().optional(),
});

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function createBusinessAction(formData: FormData) {
  const user = await requireUser();
  await ensureLocalUser(user);

  const parsed = schema.parse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") ?? "")),
    phone: formData.get("phone") || undefined,
  });

  const existing = await prisma.business.findUnique({ where: { slug: parsed.slug } });
  if (existing) {
    throw new Error(`O slug "${parsed.slug}" já está em uso. Tente outro.`);
  }

  const business = await prisma.business.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      phone: parsed.phone,
      memberships: { create: { userId: user.id, role: "OWNER" } },
      subscription: { create: { status: "INACTIVE", plan: "BASIC" } },
    },
  });

  redirect(`/billing/required?business=${business.id}`);
}
