import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { createService, deleteService } from "./actions";

export default async function ServicosPage() {
  const { ctx } = await requireActiveSubscription();
  const services = await prisma.service.findMany({
    where: { businessId: ctx.businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Serviços</h1>

      <form action={createService} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[2fr_1fr_1fr_auto]">
        <input name="name" required placeholder="Nome (ex: Corte masculino)" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="priceBRL" required type="number" step="0.01" placeholder="Preço R$" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="durationMinutes" required type="number" defaultValue={30} placeholder="Duração (min)" className="rounded-lg border border-slate-300 px-3 py-2" />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Adicionar</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-3">Serviço</th><th className="p-3">Duração</th><th className="p-3">Preço</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t border-slate-200">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.durationMinutes} min</td>
                <td className="p-3">{formatBRL(s.priceCents)}</td>
                <td className="p-3 text-right">
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="text-xs text-red-600 hover:underline">excluir</button>
                  </form>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-sm text-slate-500">Nenhum serviço cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
