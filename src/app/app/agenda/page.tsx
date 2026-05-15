import Link from "next/link";
import { Trash2, CheckCircle2, XCircle, CalendarDays, List, LayoutGrid } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL, cn, fmtBrTime, parseBR, startOfBrDay, startOfBrWeek, addDays, brDateString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { NewAppointmentForm } from "./new-appointment-form";
import { setAppointmentStatus, deleteAppointment } from "./actions";
import { WeekShell } from "./week-shell";

const STATUS: Record<string, { label: string; variant: "info" | "success" | "warning" | "destructive" | "default" }> = {
  SCHEDULED: { label: "Agendado", variant: "info" },
  COMPLETED: { label: "Concluído", variant: "success" },
  CANCELED: { label: "Cancelado", variant: "warning" },
  NO_SHOW: { label: "Não compareceu", variant: "destructive" },
};

export default async function AgendaPage({ searchParams }: { searchParams: { date?: string; view?: string; week?: string } }) {
  const { ctx } = await requireActiveSubscription();
  const view = (searchParams.view ?? "list") === "week" ? "week" : "list";

  const [professionals, services, customers] = await Promise.all([
    prisma.professional.findMany({ where: { businessId: ctx.businessId, active: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { businessId: ctx.businessId, active: true }, orderBy: { name: "asc" } }),
    prisma.customer.findMany({ where: { businessId: ctx.businessId }, orderBy: { name: "asc" }, take: 500 }),
  ]);

  const switcher = (
    <div className="flex gap-1 rounded-lg border bg-white p-1">
      <Link href="/app/agenda?view=list" className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
        <List className="h-3.5 w-3.5" /> Lista
      </Link>
      <Link href="/app/agenda?view=week" className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium", view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
        <LayoutGrid className="h-3.5 w-3.5" /> Semana
      </Link>
    </div>
  );

  if (view === "week") {
    const weekStart = searchParams.week ? parseBR(searchParams.week) : startOfBrWeek();
    if (Number.isNaN(weekStart.getTime())) weekStart.setTime(startOfBrWeek().getTime());
    const weekEnd = addDays(weekStart, 7);

    const appointments = await prisma.appointment.findMany({
      where: { businessId: ctx.businessId, startsAt: { gte: weekStart, lt: weekEnd } },
      include: { customer: true, professional: true, service: true },
      orderBy: { startsAt: "asc" },
    });

    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <h1 className="text-3xl font-bold">Agenda</h1>
          {switcher}
        </div>

        <NewAppointmentForm professionals={professionals} services={services} customers={customers} />

        <WeekShell
          weekStartISO={brDateString(weekStart)}
          appointments={appointments.map((a) => ({
            id: a.id,
            startsAt: a.startsAt.toISOString(),
            endsAt: a.endsAt.toISOString(),
            status: a.status,
            customerName: a.customer.name,
            serviceName: a.service.name,
            professionalName: a.professional.name,
            priceCents: a.priceCents,
          }))}
        />
      </div>
    );
  }

  // LIST VIEW (existente)
  const day = searchParams.date ? parseBR(searchParams.date) : startOfBrDay(new Date());
  if (Number.isNaN(day.getTime())) day.setTime(startOfBrDay().getTime());
  const next = addDays(day, 1);
  const todayISO = brDateString(day);

  const appointments = await prisma.appointment.findMany({
    where: { businessId: ctx.businessId, startsAt: { gte: day, lt: next } },
    include: { customer: true, professional: true, service: true },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <div className="flex items-center gap-3">
          <form className="flex items-center gap-2">
            <input type="hidden" name="view" value="list" />
            <label className="text-sm text-muted-foreground">Data:</label>
            <Input type="date" name="date" defaultValue={todayISO} className="w-auto" />
            <Button variant="outline" type="submit" size="sm">Ver</Button>
          </form>
          {switcher}
        </div>
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
                      {fmtBrTime(a.startsAt)}<span className="text-muted-foreground">–{fmtBrTime(a.endsAt)}</span>
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
