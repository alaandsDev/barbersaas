import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NewAppointmentForm } from "./new-appointment-form";
import { setAppointmentStatus, deleteAppointment } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Agendado", COMPLETED: "Concluído", CANCELED: "Cancelado", NO_SHOW: "Não compareceu",
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
          <label className="text-sm text-muted-foreground">Data:</label>
          <Input type="date" name="date" defaultValue={todayISO} className="w-auto" />
          <Button variant="outline" type="submit">Ver</Button>
        </form>
      </div>

      <NewAppointmentForm professionals={professionals} services={services} customers={customers} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                {a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}–
                {a.endsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </TableCell>
              <TableCell>{a.customer.name}</TableCell>
              <TableCell>{a.service.name}</TableCell>
              <TableCell>{a.professional.name}</TableCell>
              <TableCell>{formatBRL(a.priceCents)}</TableCell>
              <TableCell>{STATUS_LABEL[a.status]}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  {a.status === "SCHEDULED" && (
                    <>
                      <form action={setAppointmentStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <Button type="submit" variant="ghost" size="icon" title="Concluir"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></Button>
                      </form>
                      <form action={setAppointmentStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="CANCELED" />
                        <Button type="submit" variant="ghost" size="icon" title="Cancelar"><XCircle className="h-4 w-4 text-amber-600" /></Button>
                      </form>
                    </>
                  )}
                  <form action={deleteAppointment}>
                    <input type="hidden" name="id" value={a.id} />
                    <Button type="submit" variant="ghost" size="icon" title="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {appointments.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sem agendamentos nessa data.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
