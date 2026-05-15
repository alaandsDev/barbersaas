import Link from "next/link";
import { TrendingUp, BarChart3, Receipt, Users } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL, startOfBrDay, addDays, BR_TZ } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const RANGES = [
  { key: "7d", label: "7 dias", days: 7 },
  { key: "30d", label: "30 dias", days: 30 },
  { key: "90d", label: "90 dias", days: 90 },
];

export default async function FinanceiroPage({ searchParams }: { searchParams: { range?: string } }) {
  const { ctx } = await requireActiveSubscription();
  const range = RANGES.find((r) => r.key === searchParams.range) ?? RANGES[0];

  const start = addDays(startOfBrDay(new Date()), -(range.days - 1));

  const completed = await prisma.appointment.findMany({
    where: { businessId: ctx.businessId, status: "COMPLETED", startsAt: { gte: start } },
    include: {
      professional: { select: { id: true, name: true, commissionPercent: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const totalRevenue = completed.reduce((s, a) => s + a.priceCents, 0);
  const totalCommissions = completed.reduce((s, a) => s + Math.round(a.priceCents * a.professional.commissionPercent / 100), 0);
  const net = totalRevenue - totalCommissions;

  // por dia (em BRT)
  const dailyRevenue = Array.from({ length: range.days }, (_, i) => {
    const d = addDays(start, i);
    return completed.filter((a) => sameBrDay(a.startsAt, d)).reduce((s, a) => s + a.priceCents, 0);
  });

  // por profissional
  type ProAgg = { id: string; name: string; commissionPercent: number; revenue: number; count: number; commission: number; net: number };
  const proMap = new Map<string, ProAgg>();
  for (const a of completed) {
    const cur = proMap.get(a.professional.id) ?? {
      id: a.professional.id, name: a.professional.name, commissionPercent: a.professional.commissionPercent,
      revenue: 0, count: 0, commission: 0, net: 0,
    };
    cur.revenue += a.priceCents;
    cur.count++;
    proMap.set(a.professional.id, cur);
  }
  const byPro = [...proMap.values()].map((p) => {
    p.commission = Math.round(p.revenue * p.commissionPercent / 100);
    p.net = p.revenue - p.commission;
    return p;
  }).sort((a, b) => b.revenue - a.revenue);

  // por servico
  const svcMap = new Map<string, { name: string; count: number; revenue: number }>();
  for (const a of completed) {
    const cur = svcMap.get(a.service.id) ?? { name: a.service.name, count: 0, revenue: 0 };
    cur.count++; cur.revenue += a.priceCents;
    svcMap.set(a.service.id, cur);
  }
  const byService = [...svcMap.values()].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="mt-1 text-sm text-muted-foreground">Receita, comissões e desempenho por profissional</p>
        </div>
        <div className="flex gap-1 rounded-lg border bg-white p-1">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/app/financeiro?range=${r.key}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${r.key === range.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard icon={Receipt} label="Receita bruta" value={formatBRL(totalRevenue)} sublabel={`${completed.length} atendimentos`} gradient="from-blue-500/10 to-blue-50" iconColor="text-blue-600" />
        <KpiCard icon={Users} label="Comissões a pagar" value={formatBRL(totalCommissions)} sublabel="Soma das comissões dos profissionais" gradient="from-amber-500/10 to-amber-50" iconColor="text-amber-600" />
        <KpiCard icon={TrendingUp} label="Líquido" value={formatBRL(net)} sublabel="Receita − comissões" gradient="from-emerald-500/10 to-emerald-50" iconColor="text-emerald-600" />
      </div>

      {/* chart */}
      <Card className="card-elevated p-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          Receita por dia · {range.label}
        </div>
        <div className="mt-4">
          <Sparkline data={dailyRevenue} color="hsl(217 91% 50%)" height={180} />
        </div>
      </Card>

      {/* por profissional */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Desempenho por profissional</h2>
        {byPro.length === 0 ? (
          <EmptyState icon={Users} title="Sem dados no período" description="Conclua atendimentos para ver receita e comissões aqui." />
        ) : (
          <Card className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead className="text-right">Atendimentos</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">% Comissão</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead className="text-right">Líquido p/ casa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byPro.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name={p.name} size="sm" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{p.count}</TableCell>
                    <TableCell className="text-right font-medium">{formatBRL(p.revenue)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.commissionPercent}%</TableCell>
                    <TableCell className="text-right font-medium text-amber-700">{formatBRL(p.commission)}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-700">{formatBRL(p.net)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </section>

      {/* por servico */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Por serviço</h2>
        {byService.length === 0 ? (
          <EmptyState icon={Receipt} title="Sem dados no período" description="Conclua atendimentos para ver o ranking de serviços." />
        ) : (
          <Card className="card-elevated overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">Atendimentos</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">% do total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byService.map((s) => (
                  <TableRow key={s.name}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-right">{s.count}</TableCell>
                    <TableCell className="text-right font-medium">{formatBRL(s.revenue)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {totalRevenue > 0 ? `${Math.round((s.revenue / totalRevenue) * 100)}%` : "—"}
                    </TableCell>
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

function KpiCard({ icon: Icon, label, value, sublabel, gradient, iconColor }: {
  icon: any; label: string; value: string; sublabel?: string; gradient: string; iconColor: string;
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
    </Card>
  );
}

function sameBrDay(a: Date, b: Date) {
  const f = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: BR_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return f(a) === f(b);
}
