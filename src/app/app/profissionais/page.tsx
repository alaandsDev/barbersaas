import { Trash2, UserCog } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { createProfessional, deleteProfessional, updateCommission } from "./actions";

export default async function ProfissionaisPage() {
  const { ctx } = await requireActiveSubscription();
  const items = await prisma.professional.findMany({
    where: { businessId: ctx.businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profissionais</h1>

      <Card>
        <CardContent className="p-4">
          <form action={createProfessional} className="grid gap-3 md:grid-cols-[1.5fr_2fr_120px_auto]">
            <Input name="name" required placeholder="Nome" />
            <Input name="bio" placeholder="Bio (opcional)" />
            <Input name="commissionPercent" type="number" min={0} max={100} defaultValue={50} placeholder="Comissão %" />
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Cadastre os profissionais"
          description="Cada profissional terá sua própria agenda e poderá receber agendamentos individualmente."
        />
      ) : (
        <Card className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead className="w-32">Comissão</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.bio}</TableCell>
                  <TableCell>
                    <form action={updateCommission} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      <Input name="commissionPercent" type="number" min={0} max={100} defaultValue={p.commissionPercent} className="h-8 w-16 text-sm" />
                      <span className="text-xs text-muted-foreground">%</span>
                      <Button type="submit" variant="ghost" size="sm" className="h-8 px-2 text-xs">Salvar</Button>
                    </form>
                  </TableCell>
                  <TableCell className="w-10 text-right">
                    <form action={deleteProfessional}>
                      <input type="hidden" name="id" value={p.id} />
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
