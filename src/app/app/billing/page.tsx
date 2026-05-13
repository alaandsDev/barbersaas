import Link from "next/link";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PortalButton } from "./portal-button";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativa",
  TRIALING: "Em teste",
  PAST_DUE: "Pagamento atrasado",
  CANCELED: "Cancelada",
  INCOMPLETE: "Incompleta",
  INACTIVE: "Inativa",
};

export default async function BillingPage() {
  const ctx = await requireTenant();
  const sub = await prisma.subscription.findUnique({ where: { businessId: ctx.businessId } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Plano & Cobrança</h1>

      <div className="rounded-xl border border-slate-200 p-6">
        <div className="text-sm text-slate-500">Plano atual</div>
        <div className="mt-1 text-2xl font-bold">{sub?.plan ?? "—"}</div>
        <div className="mt-2 text-sm">Status: <span className="font-medium">{STATUS_LABEL[sub?.status ?? "INACTIVE"]}</span></div>
        {sub?.currentPeriodEnd && (
          <div className="mt-1 text-sm text-slate-600">
            Próxima cobrança: {sub.currentPeriodEnd.toLocaleDateString("pt-BR")}
            {sub.cancelAtPeriodEnd && " (cancelamento agendado)"}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {sub?.stripeCustomerId ? (
            <PortalButton />
          ) : (
            <Link href="/billing/required" className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white">
              Escolher plano
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
