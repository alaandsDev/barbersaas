import { requireTenant } from "@/lib/auth";
import { PLANS, type PlanKey } from "@/lib/stripe";
import { CheckoutButton } from "./checkout-button";

export default async function BillingRequiredPage() {
  await requireTenant();
  const order: PlanKey[] = ["BASIC", "PRO", "PREMIUM"];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold">Escolha seu plano para ativar o BarberOS</h1>
      <p className="mt-2 text-slate-600">Você pode trocar ou cancelar a qualquer momento.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {order.map((key) => {
          const p = PLANS[key];
          return (
            <div key={key} className={`rounded-2xl border p-6 ${p.popular ? "border-brand-accent shadow-xl" : "border-slate-200"}`}>
              {p.popular && (
                <div className="mb-2 inline-block rounded-full bg-brand-accent px-3 py-1 text-xs font-bold text-white">MAIS POPULAR</div>
              )}
              <div className="text-xl font-semibold">{p.name}</div>
              <div className="mt-2 text-3xl font-bold">{p.priceBRL}<span className="text-base font-normal text-slate-500">/mês</span></div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {p.features.map((x) => <li key={x}>✓ {x}</li>)}
              </ul>
              <div className="mt-6">
                <CheckoutButton plan={key} />
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
