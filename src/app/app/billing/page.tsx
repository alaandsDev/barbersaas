import Link from "next/link";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalButton } from "./portal-button";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativa", TRIALING: "Em teste", PAST_DUE: "Pagamento atrasado",
  CANCELED: "Cancelada", INCOMPLETE: "Incompleta", INACTIVE: "Inativa",
};

export default async function BillingPage() {
  const ctx = await requireTenant();
  const sub = await prisma.subscription.findUnique({ where: { businessId: ctx.businessId } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Plano & Cobrança</h1>

      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground">Plano atual</div>
          <div className="mt-1 text-2xl font-bold">{sub?.plan ?? "—"}</div>
          <div className="mt-2 text-sm">Status: <span className="font-medium">{STATUS_LABEL[sub?.status ?? "INACTIVE"]}</span></div>
          {sub?.currentPeriodEnd && (
            <div className="mt-1 text-sm text-muted-foreground">
              Próxima cobrança: {sub.currentPeriodEnd.toLocaleDateString("pt-BR")}
              {sub.cancelAtPeriodEnd && " (cancelamento agendado)"}
            </div>
          )}
          <div className="mt-6 flex gap-3">
            {sub?.stripeCustomerId ? (
              <PortalButton />
            ) : (
              <Button asChild variant="accent"><Link href="/billing/required">Escolher plano</Link></Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
