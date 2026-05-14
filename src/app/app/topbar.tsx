"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/agenda": "Agenda",
  "/app/clientes": "Clientes",
  "/app/profissionais": "Profissionais",
  "/app/servicos": "Serviços",
  "/app/financeiro": "Financeiro",
  "/app/indicacoes": "Indique e ganhe",
  "/app/billing": "Plano & Cobrança",
};

export function Topbar({ userEmail, userInitial }: { userEmail: string; userInitial: string }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "BarberOS";
  const [mac, setMac] = useState(false);
  useEffect(() => { setMac(typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)); }, []);

  function openPalette() {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/80 px-8 backdrop-blur">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">BarberOS</div>
        <div className="text-base font-semibold">{title}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={openPalette}
          className="hidden items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar</span>
          <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">{mac ? "⌘" : "Ctrl"} K</kbd>
        </button>
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium leading-none">{userEmail}</div>
          <div className="mt-1 text-xs text-muted-foreground">Owner</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
