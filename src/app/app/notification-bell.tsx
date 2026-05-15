"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

type Notif = {
  id: string;
  kind: string;
  title: string;
  body?: string | null;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const r = await fetch("/api/notifications", { cache: "no-store" });
      if (!r.ok) return;
      const data = await r.json();
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "mark-all-read" }),
    });
    load();
  }

  async function markOne(id: string) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "mark-read", id }),
    });
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="card-floating absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-white/5 bg-popover">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <div className="text-sm font-semibold">Notificações</div>
            {unread > 0 && (
              <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <CheckCheck className="h-3 w-3" /> Marcar todas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">Sem notificações</div>
            ) : (
              <ul className="divide-y">
                {items.map((n) => {
                  const Wrap: any = n.link ? Link : "div";
                  const props = n.link ? { href: n.link } : {};
                  return (
                    <li key={n.id}>
                      <Wrap
                        {...props}
                        onClick={() => { if (!n.readAt) markOne(n.id); setOpen(false); }}
                        className={`block px-4 py-3 transition-colors hover:bg-muted/60 ${!n.readAt ? "bg-amber-400/[0.04]" : ""}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.readAt && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{n.title}</div>
                            {n.body && <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</div>}
                            <div className="mt-1 text-[10px] text-muted-foreground">
                              {new Date(n.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      </Wrap>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
