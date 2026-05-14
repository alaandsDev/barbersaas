import { Check, Gift } from "lucide-react";
import { requireTenant } from "@/lib/auth";
import { PLANS, type PlanKey } from "@/lib/stripe";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutButton } from "./checkout-button";

export default async function BillingRequiredPage() {
  await requireTenant();
  const order: PlanKey[] = ["BASIC", "PRO", "PREMIUM"];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">Escolha seu plano para ativar o BarberOS</h1>
      <p className="mt-2 text-muted-foreground">Você pode trocar ou cancelar a qualquer momento.</p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
        <Gift className="h-4 w-4" /> 3 dias grátis em qualquer plano — sem cartão de crédito
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {order.map((key) => {
          const p = PLANS[key];
          return (
            <Card key={key} className={p.popular ? "border-accent shadow-xl" : ""}>
              <CardContent className="p-6">
                {p.popular && (
                  <div className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">MAIS POPULAR</div>
                )}
                <div className="text-xl font-semibold">{p.name}</div>
                <div className="mt-2 text-3xl font-bold">{p.priceBRL}<span className="text-base font-normal text-muted-foreground">/mês</span></div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {p.features.map((x) => (
                    <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> {x}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <CheckoutButton plan={key} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
