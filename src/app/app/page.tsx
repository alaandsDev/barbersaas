import Link from "next/link";
import { Calendar, DollarSign, Users, ArrowRight, CalendarPlus, TrendingUp, Trophy } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sparkline } from "@/components/ui/sparkline";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicLinkBanner } from "./public-link-banner";

export default async function DashboardPage() {
  const { ctx } = await requireActiveSubscription();
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const tomorrow = new Date(start); tomorrow.setDate(tomorrow.getDate() + 1);
  const sevenDaysAgo = new Date(start); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const business = await prisma.business.findUnique({ where: { id: ctx.businessId }, select: { slug: true } });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const publicUrl = `${appUrl}/b/${business?.slug ?? ""}`;

  const [todays, upcoming, weekCompleted, totalCustomers, weeklyAggs] = await Promise.all([
    prisma.appointment.findMany({
      where: { businessId: ctx.businessId, startsAt: { gte: start, lt: tomorrow } },
      include: { customer: true, professional: true, service: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { businessId: ctx.businessId, startsAt: { gte: now }, status: "SCHEDULED" },
      include: { customer: true, professional: true, service: true },
      orderBy: { startsAt: "asc" },
      take: 6,
    }),
    prisma.appointment.aggregate({
      where: {
        businessId: ctx.businessId,
        status: "COMPLETED",
        startsAt: { gte: sevenDaysAgo },
      },
      _sum: { priceCents: true },
      _count: true,
    }),
    prisma.customer.count({ where: { businessId: ctx.businessId } }),
    prisma.appointment.findMany({
      where: { businessId: ctx.businessId, status: "COMPLETED", startsAt: { gte: sevenDaysAgo } },
      select: { startsAt: true, priceCents: true, professionalId: true, professional: { select: { name: true } } },
    }),
  ]);

  // Receita por dia (últimos 7 dias)
  const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo); d.setDate(d.getDate() + i);
    return weeklyAggs
      .filter((a) => sameDay(a.startsAt, d))
      .reduce((sum, a) => sum + a.priceCents, 0);
  });

  // Top profissionais por atendimentos
  const proStats = new Map<string, { name: string; count: number; revenue: number }>();
  for (const a of weeklyAggs) {
    const cur = proStats.get(a.professionalId) ?? { name: a.professional.name, count: 0, revenue: 0 };
    cur.count++;
    cur.revenue += a.priceCents;
    proStats.set(a.professionalId, cur);
  }
  const topPros = [...proStats.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 4);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const revenue7d = weekCompleted._sum.priceCents ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{greeting} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumo de {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
      </div>

      <PublicLinkBanner url={publicUrl} />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          icon={Calendar}
          label="Agendamentos hoje"
          value={String(todays.length)}
          sublabel={`${upcoming.length} futuros agendados`}
          gradient="from-blue-500/10 to-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          icon={DollarSign}
          label="Receita últimos 7 dias"
          value={formatBRL(revenue7d)}
          sublabel={`${weekCompleted._count} atendimentos concluídos`}
          gradient="from-emerald-500/10 to-emerald-50"
          iconColor="text-emerald-600"
          trend={dailyRevenue}
        />
        <KpiCard
          icon={Users}
          label="Clientes na base"
          value={String(totalCustomers)}
          sublabel="Cadastrados no total"
          gradient="from-amber-500/10 to-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Revenue chart + top pros */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Receita — últimos 7 dias
              </div>
              <div className="mt-2 text-3xl font-bold">{formatBRL(revenue7d)}</div>
            </div>
          </div>
          <div className="mt-4">
            <Sparkline data={dailyRevenue} color="hsl(142 71% 35%)" height={140} />
            <div className="mt-2 grid grid-cols-7 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(sevenDaysAgo); d.setDate(d.getDate() + i);
                return <div key={i}>{d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</div>;
              })}
            </div>
          </div>
        </Card>

        <Card className="card-elevated p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Trophy className="h-4 w-4 text-amber-600" />
            Top profissionais (7d)
          </div>
          {topPros.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Sem dados ainda — conclua atendimentos pra aparecer aqui.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {topPros.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{i + 1}</div>
                  <Avatar name={p.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.count} atendimentos</div>
                  </div>
                  <div className="text-sm font-semibold">{formatBRL(p.revenue)}</div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      {/* Upcoming */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Próximos agendamentos</h2>
            <p className="text-sm text-muted-foreground">{upcoming.length === 0 ? "Sua agenda está livre." : `${upcoming.length} agendamento(s) à frente`}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/agenda">Ver agenda <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="Nenhum agendamento à frente"
            description="Crie agendamentos manualmente ou compartilhe sua agenda pública para que os clientes marquem sozinhos."
            cta={{ href: "/app/agenda", label: "Novo agendamento" }}
          />
        ) : (
          <Card className="card-elevated divide-y">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-4">
                <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-muted py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {a.startsAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")}
                  </div>
                  <div className="text-base font-bold">
                    {a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <Avatar name={a.customer.name} />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">{a.customer.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.service.name} · com {a.professional.name}</div>
                </div>
                <div className="text-sm font-semibold">{formatBRL(a.priceCents)}</div>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sublabel, gradient, iconColor, trend }: {
  icon: any; label: string; value: string; sublabel?: string; gradient: string; iconColor: string; trend?: number[];
}) {
  return (
    <Card className={`card-elevated relative overflow-hidden bg-gradient-to-br ${gradient} p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
          {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/80 shadow-sm">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {trend && <div className="mt-4 -mb-2 -mx-2"><Sparkline data={trend} color="hsl(142 71% 35%)" height={40} /></div>}
    </Card>
  );
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
