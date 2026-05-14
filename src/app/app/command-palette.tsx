"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Calendar, LayoutDashboard, Users, Scissors, BadgeDollarSign, UserCog, Gift, BarChart3, LogOut, Search } from "lucide-react";

const items = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, group: "Navegar" },
  { href: "/app/agenda", label: "Agenda", icon: Calendar, group: "Navegar" },
  { href: "/app/clientes", label: "Clientes", icon: Users, group: "Navegar" },
  { href: "/app/profissionais", label: "Profissionais", icon: UserCog, group: "Navegar" },
  { href: "/app/servicos", label: "Serviços", icon: Scissors, group: "Navegar" },
  { href: "/app/financeiro", label: "Financeiro", icon: BarChart3, group: "Navegar" },
  { href: "/app/indicacoes", label: "Indique e ganhe", icon: Gift, group: "Navegar" },
  { href: "/app/billing", label: "Plano & Cobrança", icon: BadgeDollarSign, group: "Navegar" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function signOut() {
    setOpen(false);
    const f = document.createElement("form");
    f.method = "post"; f.action = "/auth/signout"; document.body.appendChild(f); f.submit();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[15vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <Command
        className="card-floating w-full max-w-lg overflow-hidden rounded-xl border bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Command.Input
            autoFocus
            placeholder="Buscar páginas, ações..."
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">ESC</kbd>
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhum resultado.</Command.Empty>
          <Command.Group heading="Navegar" className="text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {items.map((it) => (
              <Command.Item
                key={it.href}
                value={it.label}
                onSelect={() => go(it.href)}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-muted"
              >
                <it.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{it.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Conta" className="mt-1 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            <Command.Item
              value="Sair"
              onSelect={signOut}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-muted"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Sair</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
