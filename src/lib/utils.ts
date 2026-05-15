import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

// ============================
// Timezone helpers (Brasil = UTC-3, sem DST desde 2019)
// ============================
export const BR_OFFSET = "-03:00";
export const BR_TZ = "America/Sao_Paulo";

/** Parse "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm[:ss]" como horário do Brasil */
export function parseBR(input: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return new Date(`${input}T00:00:00${BR_OFFSET}`);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) return new Date(`${input}:00${BR_OFFSET}`);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input)) return new Date(`${input}${BR_OFFSET}`);
  return new Date(input);
}

/** Início do dia (00:00 BRT) para a data informada (default: hoje em BRT) */
export function startOfBrDay(d: Date = new Date()): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: BR_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return new Date(`${ymd}T00:00:00${BR_OFFSET}`);
}

/** Adiciona N dias mantendo a referência em BRT */
export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}

/** Início da semana (segunda 00:00 BRT) */
export function startOfBrWeek(d: Date = new Date()): Date {
  const day = startOfBrDay(d);
  // dia da semana em BRT
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: BR_TZ, weekday: "short" }).format(day);
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return addDays(day, -(map[wd] ?? 0));
}

/** YYYY-MM-DD do dia em BRT */
export function brDateString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BR_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function fmtBrTime(d: Date): string {
  return d.toLocaleTimeString("pt-BR", { timeZone: BR_TZ, hour: "2-digit", minute: "2-digit" });
}

export function fmtBrDate(d: Date, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }): string {
  return d.toLocaleDateString("pt-BR", { timeZone: BR_TZ, ...opts });
}

export function fmtBrDateTime(d: Date, opts: Intl.DateTimeFormatOptions = {}): string {
  return d.toLocaleString("pt-BR", { timeZone: BR_TZ, weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit", ...opts });
}

export function fmtBrShort(d: Date): string {
  return d.toLocaleDateString("pt-BR", { timeZone: BR_TZ, day: "2-digit", month: "short" });
}
