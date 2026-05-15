"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Calendar, LayoutDashboard, Users, Scissors, BadgeDollarSign, UserCog, Gift, LogOut, BarChart3, Settings, Ban, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "./mobile-store";

const groups = [
  {
    title: "Geral",
    items: [
      { href: "/app", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/agenda", label: "Agenda", icon: Calendar },
      { href: "/app/bloqueios", label: "Bloqueios", icon: Ban },
    ],
  },
  {
    title: "Operação",
    items: [
      { href: "/app/clientes", label: "Clientes", icon: Users },
      { href: "/app/profissionais", label: "Profissionais", icon: UserCog },
      { href: "/app/servicos", label: "Serviços", icon: Scissors },
    ],
  },
  {
    title: "Negócio",
    items: [
      { href: "/app/financeiro", label: "Financeiro", icon: BarChart3 },
      { href: "/app/indicacoes", label: "Indicações", icon: Gift },
      { href: "/app/settings", label: "Configurações", icon: Settings },
      { href: "/app/billing", label: "Cobrança", icon: BadgeDollarSign },
    ],
  },
];

export function Sidebar({ businessName, plan, status }: { businessName: string; plan: string; status: string }) {
  const pathname = usePathname();
  const trialing = status === "TRIALING";
  const { mobileOpen, close } = useMobileMenu();

  // Fecha drawer ao mudar de rota
  useEffect(() => { close(); }, [pathname, close]);

  // Trava scroll do body quando drawer aberto
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          onClick={close}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-white/5 bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out",
        "md:sticky md:top-0 md:h-screen md:w-[232px] md:translate-x-0 md:self-start",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* logo + brand */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-[0_0_20px_-5px_rgba(245,158,11,0.6)]">
              <Scissors className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold leading-none text-white">BarberOS</div>
              <div className="mt-1 truncate text-[10px] uppercase tracking-wider text-sidebar-muted">{businessName}</div>
            </div>
          </div>
          <button
            onClick={close}
            className="rounded-md p-1.5 text-sidebar-muted hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted/70">
                {g.title}
              </div>
              <div className="space-y-0.5">
                {g.items.map((n) => {
                  const active = n.href === "/app" ? pathname === "/app" : pathname.startsWith(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all md:py-1.5 md:text-[13px]",
                        active
                          ? "bg-sidebar-active text-white"
                          : "text-sidebar-foreground hover:bg-sidebar-active/50 hover:text-white"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-amber-400" />
                      )}
                      <n.icon className={cn(
                        "h-4 w-4 transition-colors md:h-3.5 md:w-3.5",
                        active ? "text-amber-400" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                      )} />
                      <span>{n.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* footer */}
        <div className="border-t border-white/5 p-3 space-y-2">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">Plano</div>
              {trialing && (
                <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  Trial
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white">{plan}</span>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-muted transition-all hover:bg-sidebar-active/50 hover:text-white md:py-1.5 md:text-[13px]"
            >
              <LogOut className="h-4 w-4 md:h-3.5 md:w-3.5" /> Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
