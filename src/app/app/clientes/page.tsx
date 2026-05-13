import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomer, deleteCustomer } from "./actions";

export default async function ClientesPage() {
  const { ctx } = await requireActiveSubscription();
  const items = await prisma.customer.findMany({
    where: { businessId: ctx.businessId },
    include: { _count: { select: { appointments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Clientes</h1>

      <form action={createCustomer} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_2fr_auto]">
        <input name="name" required placeholder="Nome" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="phone" placeholder="Telefone" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="email" type="email" placeholder="Email" className="rounded-lg border border-slate-300 px-3 py-2" />
        <input name="notes" placeholder="Observações" className="rounded-lg border border-slate-300 px-3 py-2" />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Adicionar</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr><th className="p-3">Nome</th><th className="p-3">Telefone</th><th className="p-3">Email</th><th className="p-3">Atendimentos</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-slate-200">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c._count.appointments}</td>
                <td className="p-3 text-right">
                  <form action={deleteCustomer}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-xs text-red-600 hover:underline">excluir</button>
                  </form>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-sm text-slate-500">Nenhum cliente.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
