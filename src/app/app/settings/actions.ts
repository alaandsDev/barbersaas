"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(40).optional(),
  bio: z.string().max(280).optional(),
  brandColor: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
  coverEmoji: z.string().max(8).optional(),
});

export async function updateBusinessSettings(formData: FormData) {
  const ctx = await requireTenant();
  const p = schema.parse({
    name: formData.get("name"),
    phone: (formData.get("phone") as string) || undefined,
    bio: (formData.get("bio") as string) || undefined,
    brandColor: (formData.get("brandColor") as string) || undefined,
    coverEmoji: (formData.get("coverEmoji") as string) || undefined,
  });
  const brand = p.brandColor ? (p.brandColor.startsWith("#") ? p.brandColor : `#${p.brandColor}`) : null;
  await prisma.business.update({
    where: { id: ctx.businessId },
    data: {
      name: p.name,
      phone: p.phone || null,
      bio: p.bio || null,
      brandColor: brand,
      coverEmoji: p.coverEmoji || null,
    },
  });
  revalidatePath("/app/settings");
  revalidatePath("/app");
}
