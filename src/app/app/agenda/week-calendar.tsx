"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatBRL } from "@/lib/utils";

type Appt = {
  id: string;
  startsAt: string; // ISO
  endsAt: string;
  status: string;
  customerName: string;
  serviceName: string;
  professionalName: string;
  priceCents: number;
};

const OPEN = 8;
const CLOSE = 21;
const HOUR_PX = 56;

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-500/15 text-blue-900 ring-blue-500/30",
  COMPLETED: "bg-emerald-500/15 text-emerald-900 ring-emerald-500/30",
  CANCELED: "bg-amber-500/15 text-amber-900 ring-amber-500/30 line-through opacity-70",
  NO_SHOW: "bg-rose-500/15 text-rose-900 ring-rose-500/30",
};

function startOfWeek(d: Date) {
  const out = new Date(d); out.setHours(0, 0, 0, 0);
  const day = (out.getDay() + 6) % 7; // Mon=0
  out.setDate(out.getDate() - day);
  return out;
}

export function WeekCalendar({ appointments, weekStart, onWeekChange }: {
  appointments: Appt[];
  weekStart: Date;
  onWeekChange: (newStart: Date) => void;
}) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  }), [weekStart]);

  const totalMin = (CLOSE - OPEN) * 60;
  const pxPerMin = HOUR_PX / 60;

  const today = new Date(); today.setHours(0, 0, 0, 0);

  function shift(weeks: number) {
    const d = new Date(weekStart); d.setDate(d.getDate() + weeks * 7); onWeekChange(d);
  }
  function goToday() { onWeekChange(startOfWeek(new Date())); }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => shift(-1)} className="h-9 w-9 p-0"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={goToday} className="h-9">Hoje</Button>
          <Button variant="outline" size="sm" onClick={() => shift(1)} className="h-9 w-9 p-0"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="text-sm font-medium">
          {weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} —{" "}
          {days[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </div>

      <div className="card-elevated overflow-hidden rounded-xl border bg-white">
        {/* Cabeçalho dos dias */}
        <div className="grid border-b bg-muted/30" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div />
          {days.map((d) => {
            const isToday = d.getTime() === today.getTime();
            return (
              <div key={d.toISOString()} className="border-l px-2 py-2 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                </div>
                <div className={cn(
                  "mx-auto mt-1 grid h-7 w-7 place-items-center rounded-full text-sm font-semibold",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                )}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid de horas */}
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          {/* Coluna de horas */}
          <div className="relative" style={{ height: totalMin * pxPerMin }}>
            {Array.from({ length: CLOSE - OPEN + 1 }, (_, i) => (
              <div key={i} className="absolute -translate-y-1/2 px-2 text-[10px] font-medium text-muted-foreground"
                style={{ top: i * HOUR_PX }}
              >
                {String(OPEN + i).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {days.map((d) => {
            const dayStart = new Date(d); dayStart.setHours(OPEN, 0, 0, 0);
            const dayEnd = new Date(d); dayEnd.setHours(CLOSE, 0, 0, 0);
            const dayAppts = appointments.filter((a) => {
              const s = new Date(a.startsAt);
              return s >= dayStart && s < dayEnd;
            });

            return (
              <div key={d.toISOString()} className="relative border-l" style={{ height: totalMin * pxPerMin }}>
                {/* linhas de grade */}
                {Array.from({ length: CLOSE - OPEN }, (_, i) => (
                  <div key={i} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: (i + 1) * HOUR_PX - 1 }} />
                ))}

                {dayAppts.map((a) => {
                  const start = new Date(a.startsAt);
                  const end = new Date(a.endsAt);
                  const startMin = (start.getHours() - OPEN) * 60 + start.getMinutes();
                  const dur = (end.getTime() - start.getTime()) / 60000;
                  const top = startMin * pxPerMin;
                  const height = Math.max(dur * pxPerMin - 2, 24);
                  return (
                    <div
                      key={a.id}
                      className={cn("absolute left-1 right-1 overflow-hidden rounded-md p-1.5 text-[11px] leading-tight ring-1 ring-inset transition-shadow hover:shadow-md",
                        STATUS_COLORS[a.status] ?? "bg-slate-100 ring-slate-200")}
                      style={{ top, height }}
                      title={`${a.customerName} · ${a.serviceName} · ${a.professionalName} · ${formatBRL(a.priceCents)}`}
                    >
                      <div className="font-semibold">
                        {start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} {a.customerName}
                      </div>
                      {height > 36 && <div className="truncate text-[10px] opacity-80">{a.serviceName}</div>}
                      {height > 56 && <div className="truncate text-[10px] opacity-70">com {a.professionalName}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { startOfWeek };
