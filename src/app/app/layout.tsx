import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, LayoutDashboard, Users, Scissors, BadgeDollarSign, UserCog, Gift, LogOut } from "lucide-react";
import { requireUser, ensureLocalUser, getTenantContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/agenda", label: "Agenda", icon: Calendar },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/profissionais", label: "Profissionais", icon: UserCog },
  { href: "/app/servicos", label: "Serviços", icon: Scissors },
  { href: "/app/indicacoes", label: "Indique e ganhe", icon: Gift },
  { href: "/app/billing", label: "Plano & Cobrança", icon: BadgeDollarSign },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await ensureLocalUser(user);
  const ctx = await getTenantContext();
  if (!ctx) redirect("/onboarding");

  const business = await prisma.business.findUnique({
    where: { id: ctx.businessId },
    include: { subscription: true },
  });

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr]">
      <aside className="flex flex-col border-r bg-muted/30 p-4">
        <div className="mb-1 px-2 text-lg font-bold">BarberOS</div>
        <div className="mb-6 truncate px-2 text-xs text-muted-foreground">{business?.name}</div>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="outline" className="w-full"><LogOut className="h-4 w-4" /> Sair</Button>
        </form>
      </aside>
      <main className="overflow-auto p-8">{children}</main>
    </div>
  );
}
