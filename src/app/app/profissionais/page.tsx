import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProfessional, deleteProfessional } from "./actions";

export default async function ProfissionaisPage() {
  const { ctx } = await requireActiveSubscription();
  const items = await prisma.professional.findMany({
    where: { businessId: ctx.businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profissionais</h1>

      <form action={createProfessional} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_2fr_auto]">
        <input name="name" required placeholder="Nome" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="bio" placeholder="Bio (opcional)" className="rounded-lg border border-slate-300 px-3 py-2" />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Adicionar</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left"><tr><th className="p-3">Nome</th><th className="p-3">Bio</th><th className="p-3"></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-slate-200">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-slate-600">{p.bio}</td>
                <td className="p-3 text-right">
                  <form action={deleteProfessional}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-xs text-red-600 hover:underline">excluir</button>
                  </form>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-sm text-slate-500">Nenhum profissional.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
