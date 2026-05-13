import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";

export default async function DashboardPage() {
  const { ctx } = await requireActiveSubscription();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);

  const [todays, week] = await Promise.all([
    prisma.appointment.findMany({
      where: { businessId: ctx.businessId, startsAt: { gte: start, lt: end } },
      include: { customer: true, professional: true, service: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.appointment.aggregate({
      where: {
        businessId: ctx.businessId,
        status: "COMPLETED",
        startsAt: { gte: new Date(Date.now() - 7 * 86400_000) },
      },
      _sum: { priceCents: true },
      _count: true,
    }),
  ]);

  const revenue7d = week._sum.priceCents ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Agendamentos hoje" value={String(todays.length)} />
        <Card title="Receita últimos 7d" value={formatBRL(revenue7d)} />
        <Card title="Atendimentos 7d" value={String(week._count)} />
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Agenda de hoje</h2>
        {todays.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum agendamento hoje.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-3">Hora</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Serviço</th>
                  <th className="p-3">Profissional</th>
                  <th className="p-3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {todays.map((a) => (
                  <tr key={a.id} className="border-t border-slate-200">
                    <td className="p-3">{a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="p-3">{a.customer.name}</td>
                    <td className="p-3">{a.service.name}</td>
                    <td className="p-3">{a.professional.name}</td>
                    <td className="p-3">{formatBRL(a.priceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
