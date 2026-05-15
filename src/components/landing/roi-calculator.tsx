"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function brl(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);
}

export function RoiCalculator() {
  const [pros, setPros] = useState(3);
  const [perDay, setPerDay] = useState(8); // atendimentos/profissional/dia
  const [ticket, setTicket] = useState(45); // R$ por atendimento
  const [days, setDays] = useState(24); // dias úteis/mês
  const [noShowPct, setNoShowPct] = useState(15); // %

  const calc = useMemo(() => {
    const totalAppts = pros * perDay * days;
    const lostNow = totalAppts * (noShowPct / 100) * ticket; // perda atual
    const lostWithSaas = totalAppts * 0.05 * ticket; // BarberOS reduz no-show pra ~5%
    const monthlyGain = lostNow - lostWithSaas;
    const yearlyGain = monthlyGain * 12;
    const planCost = pros <= 2 ? 39.9 : pros <= 5 ? 59.9 : 79.9;
    const roi = monthlyGain / planCost;
    return { totalAppts, lostNow, lostWithSaas, monthlyGain, yearlyGain, planCost, roi };
  }, [pros, perDay, ticket, days, noShowPct]);

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Quanto você vai ganhar a mais</div>
          <h2 className="text-balance mx-auto mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Calcule o lucro extra com BarberOS
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Apenas reduzindo no-show, o sistema se paga em horas.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="card-elevated p-6">
            <h3 className="text-base font-semibold">Sua barbearia</h3>
            <div className="mt-5 space-y-5">
              <Slider label="Profissionais" value={pros} min={1} max={15} onChange={setPros} suffix="" />
              <Slider label="Atendimentos por dia (cada profissional)" value={perDay} min={1} max={20} onChange={setPerDay} suffix="" />
              <Slider label="Ticket médio" value={ticket} min={20} max={200} onChange={setTicket} suffix="R$" prefix />
              <Slider label="Dias úteis no mês" value={days} min={15} max={30} onChange={setDays} suffix="" />
              <Slider label="Taxa atual de no-show" value={noShowPct} min={0} max={40} onChange={setNoShowPct} suffix="%" />
            </div>
          </Card>

          <Card className="card-floating relative overflow-hidden bg-gradient-to-br from-primary to-[hsl(230,60%,22%)] p-6 text-white">
            <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(circle_at_top_right,_hsl(38_95%_70%/.5),_transparent_60%)]" />
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <TrendingUp className="h-4 w-4" /> Resultado projetado
            </div>

            <div className="mt-5 space-y-4">
              <ResultRow label="Você perde hoje (no-show)" value={brl(calc.lostNow)} muted />
              <ResultRow label="Com BarberOS perderia apenas" value={brl(calc.lostWithSaas)} muted />
              <div className="border-t border-white/20 pt-4">
                <div className="text-xs uppercase tracking-wider text-white/70">Lucro extra por mês</div>
                <div className="mt-1 text-4xl font-bold tracking-tight text-amber-300">{brl(calc.monthlyGain)}</div>
                <div className="mt-1 text-xs text-white/60">{brl(calc.yearlyGain)} no ano</div>
              </div>
              <div className="border-t border-white/20 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Plano sugerido</span>
                  <span className="font-medium">{brl(calc.planCost)}/mês</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-white/70">Retorno sobre investimento</span>
                  <span className="font-bold text-amber-300">{calc.roi.toFixed(0)}x</span>
                </div>
              </div>
            </div>

            <Button asChild variant="accent" className="mt-6 w-full">
              <Link href="/signup">Começar a economizar grátis <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Slider({ label, value, min, max, onChange, suffix, prefix }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; suffix?: string; prefix?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-bold tabular-nums">
          {prefix ? `${suffix} ${value}` : `${value}${suffix ? suffix : ""}`}
        </span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-amber-500"
      />
    </div>
  );
}

function ResultRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className={muted ? "text-white/80" : "font-semibold"}>{value}</span>
    </div>
  );
}
