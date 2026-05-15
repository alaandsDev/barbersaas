import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownRight, Calendar, DollarSign, Users, CalendarPlus, TrendingUp, Trophy, Clock } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL, fmtBrTime, fmtBrShort, startOfBrDay, addDays, BR_TZ, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Sparkline } from "@/components/ui/sparkline";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicLinkBanner } from "./public-link-banner";

export default async function DashboardPage() {
  const { ctx } = await requireActiveSubscription();
  const now = new Date();
  const today = startOfBrDay(now);
  const tomorrow = addDays(today, 1);
  const sevenDaysAgo = addDays(today, -6);
  const fourteenDaysAgo = addDays(today, -13);

  const business = await prisma.business.findUnique({ where: { id: ctx.businessId }, select: { slug: true } });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const publicUrl = `${appUrl}/b/${business?.slug ?? ""}`;

  const [todays, upcoming, last7, prev7, totalCustomers, customers7, customersPrev7] = await Promise.all([
    prisma.appointment.findMany({
      where: { businessId: ctx.businessId, startsAt: { gte: today, lt: tomorrow } },
      include: { customer: true, professional: true, service: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { businessId: ctx.businessId, startsAt: { gte: now }, status: "SCHEDULED" },
      include: { customer: true, professional: true, service: true },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
    prisma.appointment.findMany({
      where: { businessId: ctx.businessId, status: "COMPLETED", startsAt: { gte: sevenDaysAgo, lt: tomorrow } },
      select: { startsAt: true, priceCents: true, professionalId: true, professional: { select: { name: true } } },
    }),
    prisma.appointment.aggregate({
      where: { businessId: ctx.businessId, status: "COMPLETED", startsAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      _sum: { priceCents: true },
      _count: true,
    }),
    prisma.customer.count({ where: { businessId: ctx.businessId } }),
    prisma.customer.count({ where: { businessId: ctx.businessId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.customer.count({ where: { businessId: ctx.businessId, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
  ]);

  const revenue7d = last7.reduce((s, a) => s + a.priceCents, 0);
  const count7d = last7.length;
  const prevRev = prev7._sum.priceCents ?? 0;
  const prevCount = prev7._count ?? 0;

  const revenueDelta = pctDelta(revenue7d, prevRev);
  const countDelta = pctDelta(count7d, prevCount);
  const customersDelta = pctDelta(customers7, customersPrev7);

  // serie de receita por dia
  const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(sevenDaysAgo, i);
    return last7.filter((a) => sameBrDay(a.startsAt, d)).reduce((s, a) => s + a.priceCents, 0);
  });

  // top profissionais por receita
  const proStats = new Map<string, { name: string; count: number; revenue: number }>();
  for (const a of last7) {
    const cur = proStats.get(a.professionalId) ?? { name: a.professional.name, count: 0, revenue: 0 };
    cur.count++;
    cur.revenue += a.priceCents;
    proStats.set(a.professionalId, cur);
  }
  const topPros = [...proStats.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRev = Math.max(...topPros.map((p) => p.revenue), 1);

  const greeting = (() => {
    const h = parseInt(new Intl.DateTimeFormat("en-US", { timeZone: BR_TZ, hour: "numeric", hour12: false }).format(now));
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{greeting}.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumo de {now.toLocaleDateString("pt-BR", { timeZone: BR_TZ, weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
        <Button asChild variant="accent" size="sm" className="self-start sm:self-auto">
          <Link href="/app/agenda">
            <CalendarPlus className="h-4 w-4" /> Novo agendamento
          </Link>
        </Button>
      </div>

      <PublicLinkBanner url={publicUrl} />

      {/* KPIs */}
      <div className="grid gap-5 md:grid-cols-3">
        <KpiCard
          icon={DollarSign}
          glow="emerald"
          label="Receita · últimos 7 dias"
          value={formatBRL(revenue7d)}
          delta={revenueDelta}
          sublabel={`${count7d} atendimentos concluídos`}
          trend={dailyRevenue}
          trendColor="hsl(142 71% 50%)"
        />
        <KpiCard
          icon={Calendar}
          glow="blue"
          label="Agendamentos hoje"
          value={String(todays.length)}
          delta={countDelta}
          sublabel={`${upcoming.length} próximos confirmados`}
        />
        <KpiCard
          icon={Users}
          glow="amber"
          label="Clientes na base"
          value={String(totalCustomers)}
          delta={customersDelta}
          sublabel={`${customers7} novos nos últimos 7d`}
        />
      </div>

      {/* CHART + TOP PROS */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="ring-card relative overflow-hidden border-white/5 bg-card p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Receita por dia</div>
              <div className="mt-1 text-3xl font-bold tracking-tight">{formatBRL(revenue7d)}</div>
              <div className="mt-2 flex items-center gap-2">
                <DeltaPill value={revenueDelta} />
                <span className="text-xs text-muted-foreground">vs 7d anteriores</span>
              </div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-6">
            <Sparkline data={dailyRevenue} color="hsl(142 71% 50%)" height={160} />
            <div className="mt-2 grid grid-cols-7 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(sevenDaysAgo, i);
                return <div key={i}>{d.toLocaleDateString("pt-BR", { timeZone: BR_TZ, weekday: "short" }).replace(".", "")}</div>;
              })}
            </div>
          </div>
        </Card>

        <Card className="ring-card relative overflow-hidden border-white/5 bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400/10 ring-1 ring-amber-400/20">
                <Trophy className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-semibold">Top profissionais</div>
                <div className="text-xs text-muted-foreground">Últimos 7 dias</div>
              </div>
            </div>
          </div>
          {topPros.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Sem dados ainda.</p>
          ) : (
            <ol className="mt-5 space-y-4">
              {topPros.map((p, i) => (
                <li key={p.name}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold",
                      i === 0 ? "bg-amber-400/20 text-amber-400 ring-1 ring-amber-400/30" : "bg-white/5 text-muted-foreground"
                    )}>{i + 1}</div>
                    <Avatar name={p.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.count} atend.</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{formatBRL(p.revenue)}</div>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300"
                      style={{ width: `${(p.revenue / maxRev) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      {/* UPCOMING */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Próximos agendamentos</h2>
            <p className="text-sm text-muted-foreground">{upcoming.length === 0 ? "Sua agenda está livre." : `${upcoming.length} agendamento(s) à frente`}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="border-white/10 bg-white/[0.02] hover:bg-white/[0.06]">
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
          <Card className="ring-card divide-y divide-white/5 border-white/5 bg-card overflow-hidden">
            {upcoming.map((a) => (
              <div key={a.id} className="group flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.02]">
                <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-white/[0.03] py-2 ring-1 ring-white/5">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {fmtBrShort(a.startsAt).replace(".", "")}
                  </div>
                  <div className="text-base font-bold tabular-nums">{fmtBrTime(a.startsAt)}</div>
                </div>
                <Avatar name={a.customer.name} />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">{a.customer.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.service.name} · com {a.professional.name}</div>
                </div>
                <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                  <Clock className="h-3 w-3" /> {a.service.durationMinutes}min
                </div>
                <div className="text-sm font-semibold tabular-nums">{formatBRL(a.priceCents)}</div>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, delta, sublabel, glow, trend, trendColor }: {
  icon: any; label: string; value: string; delta: number | null; sublabel?: string;
  glow: "emerald" | "blue" | "amber"; trend?: number[]; trendColor?: string;
}) {
  const glowClass = `glow-${glow}`;
  const iconRing = {
    emerald: "bg-emerald-500/10 ring-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/10 ring-blue-500/20 text-blue-400",
    amber: "bg-amber-400/10 ring-amber-400/20 text-amber-400",
  }[glow];

  return (
    <Card className="ring-card relative overflow-hidden border-white/5 bg-card p-6">
      <div className={cn("pointer-events-none absolute inset-0 -z-10", glowClass)} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{value}</div>
          <div className="mt-2 flex items-center gap-2">
            <DeltaPill value={delta} />
            {sublabel && <span className="truncate text-xs text-muted-foreground">{sublabel}</span>}
          </div>
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1", iconRing)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="-mx-2 -mb-2 mt-4">
          <Sparkline data={trend} color={trendColor ?? "hsl(38 95% 53%)"} height={40} />
        </div>
      )}
    </Card>
  );
}

function DeltaPill({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">—</span>;
  }
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
      up ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
    )}>
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0 && curr === 0) return null;
  if (prev === 0) return 100;
  return ((curr - prev) / prev) * 100;
}

function sameBrDay(a: Date, b: Date) {
  const f = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: BR_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return f(a) === f(b);
}
