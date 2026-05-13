import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { NewAppointmentForm } from "./new-appointment-form";
import { setAppointmentStatus, deleteAppointment } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Agendado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

export default async function AgendaPage({ searchParams }: { searchParams: { date?: string } }) {
  const { ctx } = await requireActiveSubscription();

  const day = searchParams.date ? new Date(searchParams.date) : new Date();
  day.setHours(0, 0, 0, 0);
  const next = new Date(day); next.setDate(next.getDate() + 1);
  const todayISO = day.toISOString().slice(0, 10);

  const [appointments, professionals, services, customers] = await Promise.all([
    prisma.appointment.findMany({
      where: { businessId: ctx.businessId, startsAt: { gte: day, lt: next } },
      include: { customer: true, professional: true, service: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.professional.findMany({ where: { businessId: ctx.businessId, active: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { businessId: ctx.businessId, active: true }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { businessId: ctx.businessId }, orderBy: { name: "asc" }, take: 500 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <form className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Data:</label>
          <input type="date" name="date" defaultValue={todayISO} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Ver</button>
        </form>
      </div>

      <NewAppointmentForm professionals={professionals} services={services} customers={customers} />

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Hora</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Serviço</th>
              <th className="p-3">Profissional</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t border-slate-200">
                <td className="p-3">
                  {a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}–
                  {a.endsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="p-3">{a.customer.name}</td>
                <td className="p-3">{a.service.name}</td>
                <td className="p-3">{a.professional.name}</td>
                <td className="p-3">{formatBRL(a.priceCents)}</td>
                <td className="p-3">{STATUS_LABEL[a.status]}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {a.status === "SCHEDULED" && (
                      <>
                        <form action={setAppointmentStatus}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="status" value="COMPLETED" />
                          <button className="text-xs text-emerald-700 hover:underline">concluir</button>
                        </form>
                        <form action={setAppointmentStatus}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="status" value="CANCELED" />
                          <button className="text-xs text-amber-700 hover:underline">cancelar</button>
                        </form>
                      </>
                    )}
                    <form action={deleteAppointment}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="text-xs text-red-600 hover:underline">excluir</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-sm text-slate-500">Sem agendamentos nessa data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
