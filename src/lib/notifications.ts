import { prisma } from "@/lib/prisma";

export async function createNotification({ businessId, kind, title, body, link }: {
  businessId: string; kind: string; title: string; body?: string; link?: string;
}) {
  try {
    await prisma.notification.create({ data: { businessId, kind, title, body, link } });
  } catch (e) {
    console.error("[notifications] create failed", e);
  }
}
