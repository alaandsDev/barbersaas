import { Trash2, CheckCircle2, XCircle, CalendarDays } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { NewAppointmentForm } from "./new-appointment-form";
import { setAppointmentStatus, deleteAppointment } from "./actions";

const STATUS: Record<string, { label: string; variant: "info" | "success" | "warning" | "destructive" | "default" }> = {
  SCHEDULED: { label: "Agendado", variant: "info" },
  COMPLETED: { label: "Concluído", variant: "success" },
  CANCELED: { label: "Cancelado", variant: "warning" },
  NO_SHOW: { label: "Não compareceu", variant: "destructive" },
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

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nada nessa data"
          description="Crie um novo agendamento usando o formulário acima ou escolha outra data."
        />
      ) : (
        <Card className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => {
                const s = STATUS[a.status];
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}<span className="text-muted-foreground">–{a.endsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </TableCell>
                    <TableCell>{a.customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.service.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.professional.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatBRL(a.priceCents)}</TableCell>
                    <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                    <TableCell className="w-32">
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
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
