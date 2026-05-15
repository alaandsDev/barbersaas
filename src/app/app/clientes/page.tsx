import Link from "next/link";
import { Trash2, Users } from "lucide-react";
import { requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
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

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sua base de clientes começa aqui"
          description="Cadastre clientes manualmente ou eles serão criados automaticamente conforme você marca atendimentos."
        />
      ) : (
        <Card className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Atendimentos</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/app/clientes/${c.id}`} className="hover:underline">{c.name}</Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-right font-medium">{c._count.appointments}</TableCell>
                  <TableCell className="w-10 text-right">
                    <form action={deleteCustomer}>
                      <input type="hidden" name="id" value={c.id} />
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
