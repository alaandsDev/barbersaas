import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const TENANT_COOKIE = "bos_tenant";

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Garante que o User existe na tabela local (espelho do auth.users).
 * Idempotente — usar após login/signup.
 */
function genReferralCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function ensureLocalUser(authUser: { id: string; email?: string | null; user_metadata?: any }) {
  const email = authUser.email ?? `${authUser.id}@unknown.local`;
  const name = authUser.user_metadata?.name ?? null;
  const referredByCode = authUser.user_metadata?.referred_by_code as string | undefined;

  const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (existing) {
    if (!existing.referralCode) {
      await prisma.user.update({ where: { id: existing.id }, data: { referralCode: genReferralCode() } });
    }
    return existing;
  }

  const referredBy = referredByCode
    ? await prisma.user.findUnique({ where: { referralCode: referredByCode } })
    : null;

  return prisma.user.create({
    data: {
      id: authUser.id,
      email,
      name,
      referralCode: genReferralCode(),
      referredById: referredBy?.id,
    },
  });
}

export type TenantContext = {
  userId: string;
  businessId: string;
  role: "OWNER" | "ADMIN" | "PROFESSIONAL";
};

/**
 * Resolve o tenant ativo para o usuário logado.
 * Estratégia: cookie bos_tenant > primeira membership.
 * Retorna null se o usuário ainda não tem nenhum business (=> mandar pro onboarding).
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = cookies();
  const preferred = cookieStore.get(TENANT_COOKIE)?.value;

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  if (memberships.length === 0) return null;

  const m = memberships.find((x) => x.businessId === preferred) ?? memberships[0];
  return { userId: user.id, businessId: m.businessId, role: m.role };
}

export async function requireTenant(): Promise<TenantContext> {
  await requireUser();
  const ctx = await getTenantContext();
  if (!ctx) redirect("/onboarding");
  return ctx;
}

/**
 * Gating de assinatura — chamar nas páginas/server actions de /app.
 * Permite TRIALING e ACTIVE.
 */
export async function requireActiveSubscription() {
  const ctx = await requireTenant();
  const sub = await prisma.subscription.findUnique({ where: { businessId: ctx.businessId } });
  const ok = sub && (sub.status === "ACTIVE" || sub.status === "TRIALING");
  if (!ok) redirect("/billing/required");
  return { ctx, subscription: sub! };
}
