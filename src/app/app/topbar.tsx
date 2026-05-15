"use client";

import { useEffect, useState } from "react";
import { Search, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./notification-bell";
import { useMobileMenu } from "./mobile-store";

const TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/agenda": "Agenda",
  "/app/bloqueios": "Bloqueios",
  "/app/clientes": "Clientes",
  "/app/profissionais": "Profissionais",
  "/app/servicos": "Serviços",
  "/app/financeiro": "Financeiro",
  "/app/indicacoes": "Indique e ganhe",
  "/app/settings": "Configurações",
  "/app/billing": "Plano & Cobrança",
};

export function Topbar({ userEmail, userInitial }: { userEmail: string; userInitial: string }) {
  const pathname = usePathname();
  // matches /app/clientes/[id] etc
  const baseMatch = Object.keys(TITLES).filter((k) => pathname.startsWith(k)).sort((a, b) => b.length - a.length)[0];
  const title = (baseMatch && TITLES[baseMatch]) ?? "BarberOS";
  const [mac, setMac] = useState(false);
  useEffect(() => { setMac(typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)); }, []);
  const { open } = useMobileMenu();

  function openPalette() {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-white/5 bg-[hsl(230,30%,5%)]/70 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={open}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="hidden text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:inline">BarberOS</span>
        <span className="hidden text-muted-foreground/40 sm:inline">/</span>
        <span className="truncate text-sm font-semibold">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={openPalette}
          className="hidden items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/10 hover:bg-white/[0.05] hover:text-foreground md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="ml-2 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px]">{mac ? "⌘" : "Ctrl"} K</kbd>
        </button>
        <button
          onClick={openPalette}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] md:hidden"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </button>
        <NotificationBell />
        <div className="hidden text-right lg:block">
          <div className="text-xs font-medium leading-none">{userEmail}</div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Owner</div>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-amber-950 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
