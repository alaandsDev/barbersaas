import { Trash2, Scissors } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { createService, deleteService } from "./actions";

export default async function ServicosPage() {
  const { ctx } = await requireActiveSubscription();
  const services = await prisma.service.findMany({
    where: { businessId: ctx.businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Serviços</h1>

      <Card>
        <CardContent className="p-4">
          <form action={createService} className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
            <Input name="name" required placeholder="Nome (ex: Corte masculino)" />
            <Input name="priceBRL" required type="number" step="0.01" placeholder="Preço R$" />
            <Input name="durationMinutes" required type="number" defaultValue={30} placeholder="Duração (min)" />
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      {services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Cadastre seus serviços"
          description="Adicione corte, barba, sobrancelha — qualquer serviço com preço e duração. Aparecerão na agenda."
        />
      ) : (
        <Card className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.durationMinutes} min</TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(s.priceCents)}</TableCell>
                  <TableCell className="w-10 text-right">
                    <form action={deleteService}>
                      <input type="hidden" name="id" value={s.id} />
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
