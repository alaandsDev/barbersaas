"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LayoutDashboard, Users, Scissors, BadgeDollarSign, UserCog, Gift, LogOut, Sparkles, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/agenda", label: "Agenda", icon: Calendar },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/profissionais", label: "Profissionais", icon: UserCog },
  { href: "/app/servicos", label: "Serviços", icon: Scissors },
  { href: "/app/financeiro", label: "Financeiro", icon: BarChart3 },
  { href: "/app/indicacoes", label: "Indique e ganhe", icon: Gift },
  { href: "/app/billing", label: "Plano & Cobrança", icon: BadgeDollarSign },
];

export function Sidebar({ businessName, plan, status }: { businessName: string; plan: string; status: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col self-start bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Scissors className="h-4 w-4" />
        </div>
        <div>
          <div className="text-base font-bold leading-none text-white">BarberOS</div>
          <div className="mt-1 text-xs text-sidebar-muted">{businessName}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = n.href === "/app" ? pathname === "/app" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-active/60 hover:text-white"
              )}
            >
              <n.icon className={cn("h-4 w-4", active ? "text-accent" : "text-sidebar-muted")} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/5 p-4">
        <div className="rounded-lg bg-sidebar-active/60 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent">
            <Sparkles className="h-3 w-3" /> Plano {plan}
          </div>
          <div className="mt-1 text-xs text-sidebar-muted capitalize">{status.toLowerCase().replace("_", " ")}</div>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-active/60 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
