import { Trash2, Ban } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtBrDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { createTimeBlock, deleteTimeBlock } from "./actions";

export default async function BloqueiosPage() {
  const { ctx } = await requireActiveSubscription();
  const [blocks, professionals] = await Promise.all([
    prisma.timeBlock.findMany({
      where: { businessId: ctx.businessId, endsAt: { gte: new Date() } },
      include: { professional: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.professional.findMany({ where: { businessId: ctx.businessId, active: true }, orderBy: { name: "asc" } }),
  ]);

  const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Bloqueios</h1>
        <p className="mt-1 text-sm text-muted-foreground">Marque folgas, almoços e horários indisponíveis. Ninguém poderá agendar nesses períodos.</p>
      </div>

      <Card className="card-elevated p-4">
        {professionals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cadastre profissionais antes de criar bloqueios.</p>
        ) : (
          <form action={createTimeBlock} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <select name="professionalId" required className={selectCls}>
              <option value="">Profissional</option>
              {professionals.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Input name="startsAt" type="datetime-local" required />
            <Input name="endsAt" type="datetime-local" required />
            <Input name="reason" placeholder="Motivo (opcional)" />
            <Button type="submit">Bloquear</Button>
          </form>
        )}
      </Card>

      {blocks.length === 0 ? (
        <EmptyState icon={Ban} title="Sem bloqueios ativos" description="Adicione um período acima para impedir agendamentos." />
      ) : (
        <Card className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.professional.name}</TableCell>
                  <TableCell className="capitalize">{fmtBrDateTime(b.startsAt)}</TableCell>
                  <TableCell className="capitalize">{fmtBrDateTime(b.endsAt)}</TableCell>
                  <TableCell className="text-muted-foreground">{b.reason}</TableCell>
                  <TableCell className="w-10 text-right">
                    <form action={deleteTimeBlock}>
                      <input type="hidden" name="id" value={b.id} />
                      <Button type="submit" variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
