"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/agenda": "Agenda",
  "/app/clientes": "Clientes",
  "/app/profissionais": "Profissionais",
  "/app/servicos": "Serviços",
  "/app/indicacoes": "Indique e ganhe",
  "/app/billing": "Plano & Cobrança",
};

export function Topbar({ userEmail, userInitial }: { userEmail: string; userInitial: string }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "BarberOS";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/80 px-8 backdrop-blur">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">BarberOS</div>
        <div className="text-base font-semibold">{title}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
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
