import { Calendar, DollarSign, Users } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        <Stat icon={Calendar} title="Agendamentos hoje" value={String(todays.length)} />
        <Stat icon={DollarSign} title="Receita últimos 7d" value={formatBRL(revenue7d)} />
        <Stat icon={Users} title="Atendimentos 7d" value={String(week._count)} />
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Agenda de hoje</h2>
        {todays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum agendamento hoje.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todays.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                  <TableCell>{a.customer.name}</TableCell>
                  <TableCell>{a.service.name}</TableCell>
                  <TableCell>{a.professional.name}</TableCell>
                  <TableCell>{formatBRL(a.priceCents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{title}</div>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
