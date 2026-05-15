import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, Calendar, DollarSign, Repeat } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL, fmtBrDateTime, fmtBrTime, fmtBrShort } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS: Record<string, { label: string; variant: "info" | "success" | "warning" | "destructive" | "default" }> = {
  SCHEDULED: { label: "Agendado", variant: "info" },
  COMPLETED: { label: "Concluído", variant: "success" },
  CANCELED: { label: "Cancelado", variant: "warning" },
  NO_SHOW: { label: "Não compareceu", variant: "destructive" },
};

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const { ctx } = await requireActiveSubscription();
  const customer = await prisma.customer.findFirst({
    where: { id: params.id, businessId: ctx.businessId },
    include: {
      appointments: {
        orderBy: { startsAt: "desc" },
        include: { service: true, professional: true },
      },
    },
  });
  if (!customer) notFound();

  const completed = customer.appointments.filter((a) => a.status === "COMPLETED");
  const totalSpent = completed.reduce((s, a) => s + a.priceCents, 0);
  const lastVisit = completed[0]?.startsAt;
  const upcoming = customer.appointments.find((a) => a.status === "SCHEDULED" && a.startsAt > new Date());

  // frequência: dias entre primeira e última visita / numero de visitas
  let avgDaysBetween: number | null = null;
  if (completed.length >= 2) {
    const first = completed[completed.length - 1].startsAt;
    const last = completed[0].startsAt;
    const days = (last.getTime() - first.getTime()) / 86400_000;
    avgDaysBetween = Math.round(days / (completed.length - 1));
  }

  return (
    <div className="space-y-8">
      <Link href="/app/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para clientes
      </Link>

      <div className="flex items-start gap-4">
        <Avatar name={customer.name} size="lg" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {customer.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {customer.phone}</span>}
            {customer.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>}
          </div>
          {customer.notes && <p className="mt-2 max-w-xl text-sm text-slate-600">{customer.notes}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard icon={Calendar} label="Atendimentos" value={String(completed.length)} />
        <KpiCard icon={DollarSign} label="Total gasto" value={formatBRL(totalSpent)} />
        <KpiCard icon={Repeat} label="Frequência média" value={avgDaysBetween ? `${avgDaysBetween} dias` : "—"} />
        <KpiCard icon={Calendar} label="Última visita" value={lastVisit ? fmtBrShort(lastVisit) : "—"} />
      </div>

      {upcoming && (
        <Card className="card-elevated border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">Próximo agendamento</div>
              <div className="mt-1 text-base font-semibold capitalize">
                {fmtBrDateTime(upcoming.startsAt)}
              </div>
              <div className="mt-0.5 text-sm text-slate-600">{upcoming.service.name} · com {upcoming.professional.name}</div>
            </div>
            <div className="text-lg font-bold">{formatBRL(upcoming.priceCents)}</div>
          </div>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Histórico</h2>
        {customer.appointments.length === 0 ? (
          <EmptyState icon={Calendar} title="Nenhum agendamento" description="Esse cliente ainda não fez nenhum atendimento." />
        ) : (
          <Card className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.appointments.map((a) => {
                  const s = STATUS[a.status];
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="capitalize">
                        {fmtBrShort(a.startsAt)} · {fmtBrTime(a.startsAt)}
                      </TableCell>
                      <TableCell>{a.service.name}</TableCell>
                      <TableCell className="text-muted-foreground">{a.professional.name}</TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(a.priceCents)}</TableCell>
                      <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </section>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="card-elevated p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    </Card>
  );
}
