import Link from "next/link";
import { Calendar, DollarSign, Users, ArrowRight, CalendarPlus } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const { ctx } = await requireActiveSubscription();
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);

  const [todays, week, totalCustomers] = await Promise.all([
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
    prisma.customer.count({ where: { businessId: ctx.businessId } }),
  ]);

  const revenue7d = week._sum.priceCents ?? 0;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{greeting} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo de {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Calendar} iconBg="bg-blue-50" iconColor="text-blue-600" title="Agendamentos hoje" value={String(todays.length)} hint="Total de horários reservados" />
        <StatCard icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Receita últimos 7d" value={formatBRL(revenue7d)} hint="Atendimentos concluídos" />
        <StatCard icon={Users} iconBg="bg-amber-50" iconColor="text-amber-600" title="Clientes na base" value={String(totalCustomers)} hint={`${week._count} atendimentos na semana`} />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Agenda de hoje</h2>
            <p className="text-sm text-muted-foreground">{todays.length === 0 ? "Nenhum horário reservado." : `${todays.length} agendamento(s)`}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/agenda">Ver tudo <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        {todays.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="Sua agenda de hoje está vazia"
            description="Crie agendamentos manualmente ou compartilhe sua agenda pública para que os clientes marquem sozinhos."
            cta={{ href: "/app/agenda", label: "Novo agendamento" }}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {todays.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                    <TableCell>{a.customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.service.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.professional.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatBRL(a.priceCents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, title, value, hint }: {
  icon: any; iconBg: string; iconColor: string; title: string; value: string; hint?: string;
}) {
  return (
    <Card className="card-elevated p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}

