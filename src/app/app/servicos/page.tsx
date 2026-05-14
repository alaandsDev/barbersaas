import { Trash2 } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createService, deleteService } from "./actions";

export default async function ServicosPage() {
  const { ctx } = await requireActiveSubscription();
  const services = await prisma.service.findMany({
    where: { businessId: ctx.businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Serviços</h1>

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serviço</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.durationMinutes} min</TableCell>
              <TableCell>{formatBRL(s.priceCents)}</TableCell>
              <TableCell className="text-right">
                <form action={deleteService}>
                  <input type="hidden" name="id" value={s.id} />
                  <Button type="submit" variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {services.length === 0 && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum serviço cadastrado.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
