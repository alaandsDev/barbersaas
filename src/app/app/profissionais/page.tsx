import { Trash2 } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createProfessional, deleteProfessional } from "./actions";

export default async function ProfissionaisPage() {
  const { ctx } = await requireActiveSubscription();
  const items = await prisma.professional.findMany({
    where: { businessId: ctx.businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profissionais</h1>

      <Card>
        <CardContent className="p-4">
          <form action={createProfessional} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
            <Input name="name" required placeholder="Nome" />
            <Input name="bio" placeholder="Bio (opcional)" />
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Bio</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell className="text-muted-foreground">{p.bio}</TableCell>
              <TableCell className="text-right">
                <form action={deleteProfessional}>
                  <input type="hidden" name="id" value={p.id} />
                  <Button type="submit" variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum profissional.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}
