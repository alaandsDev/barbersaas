import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { requireTenant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { updateBusinessSettings } from "./actions";

export default async function SettingsPage() {
  const ctx = await requireTenant();
  const business = await prisma.business.findUnique({ where: { id: ctx.businessId } });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const publicUrl = `${appUrl}/b/${business?.slug ?? ""}`;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personalize a página pública da sua barbearia.</p>
      </div>

      <Card className="card-elevated p-6">
        <form action={updateBusinessSettings} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da barbearia</Label>
            <Input id="name" name="name" defaultValue={business?.name ?? ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (mostrado na pagina publica)</Label>
            <Input id="phone" name="phone" defaultValue={business?.phone ?? ""} placeholder="(11) 99999-9999" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio" name="bio" defaultValue={business?.bio ?? ""} maxLength={280}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Barbearia moderna com 10 anos de experiência. Cortes clássicos e contemporâneos."
            />
            <p className="text-xs text-muted-foreground">Aparece logo abaixo do nome na página pública. Até 280 caracteres.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brandColor">Cor da marca (hex)</Label>
              <div className="flex gap-2">
                <Input id="brandColor" name="brandColor" defaultValue={business?.brandColor ?? ""} placeholder="#f59e0b" />
                <div
                  className="h-10 w-10 shrink-0 rounded-md border"
                  style={{ background: business?.brandColor ?? "transparent" }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Usada no banner e nos botões da página pública.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverEmoji">Emoji do banner</Label>
              <Input id="coverEmoji" name="coverEmoji" defaultValue={business?.coverEmoji ?? ""} placeholder="✂️" maxLength={4} />
              <p className="text-xs text-muted-foreground">Pequeno detalhe visual no banner público.</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-5">
            <Link href={publicUrl} target="_blank" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Ver página pública <ExternalLink className="h-3 w-3" />
            </Link>
            <Button type="submit" variant="accent">Salvar alterações</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
