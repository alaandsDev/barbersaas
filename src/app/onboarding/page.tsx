import { redirect } from "next/navigation";
import { requireUser, ensureLocalUser, getTenantContext } from "@/lib/auth";
import { createBusinessAction } from "./actions";

export default async function OnboardingPage() {
  const user = await requireUser();
  await ensureLocalUser(user);

  const ctx = await getTenantContext();
  if (ctx) redirect("/app");

  return (
    <div className="mx-auto mt-24 max-w-md px-6">
      <h1 className="text-2xl font-bold">Bem-vindo ao BarberOS 👋</h1>
      <p className="mt-2 text-sm text-slate-600">Vamos criar sua barbearia em 30 segundos.</p>

      <form action={createBusinessAction} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome da barbearia</label>
          <input
            name="name" required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Ex: Barbearia do João"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug (URL)</label>
          <input
            name="slug" required pattern="[a-z0-9-]+"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="barbearia-do-joao"
          />
          <p className="mt-1 text-xs text-slate-500">Apenas letras minúsculas, números e hífen.</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Telefone (opcional)</label>
          <input
            name="phone"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="(11) 99999-9999"
          />
        </div>
        <button className="w-full rounded-lg bg-brand-accent py-2 text-sm font-semibold text-white hover:opacity-90">
          Criar e continuar
        </button>
      </form>
    </div>
  );
}
