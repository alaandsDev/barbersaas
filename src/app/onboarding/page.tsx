import { redirect } from "next/navigation";
import { requireUser, ensureLocalUser, getTenantContext } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createBusinessAction } from "./actions";

export default async function OnboardingPage() {
  const user = await requireUser();
  await ensureLocalUser(user);

  const ctx = await getTenantContext();
  if (ctx) redirect("/app");

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold">Bem-vindo ao BarberOS 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Vamos criar sua barbearia em 30 segundos.</p>

          <form action={createBusinessAction} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da barbearia</Label>
              <Input id="name" name="name" required placeholder="Ex: Barbearia do João" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" required placeholder="barbearia-do-joao" />
              <p className="text-xs text-muted-foreground">Letras minúsculas, números e hífen — ajustamos automaticamente.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
            </div>
            <Button variant="accent" className="w-full">Criar e continuar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
