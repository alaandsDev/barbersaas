import { Trash2 } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createCustomer, deleteCustomer } from "./actions";

export default async function ClientesPage() {
  const { ctx } = await requireActiveSubscription();
  const items = await prisma.customer.findMany({
    where: { businessId: ctx.businessId },
    include: { _count: { select: { appointments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Clientes</h1>

      <Card>
        <CardContent className="p-4">
          <form action={createCustomer} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_2fr_auto]">
            <Input name="name" required placeholder="Nome" />
            <Input name="phone" placeholder="Telefone" />
            <Input name="email" type="email" placeholder="Email" />
            <Input name="notes" placeholder="Observações" />
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Atendimentos</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.phone}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c._count.appointments}</TableCell>
              <TableCell className="text-right">
                <form action={deleteCustomer}>
                  <input type="hidden" name="id" value={c.id} />
                  <Button type="submit" variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum cliente.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}
