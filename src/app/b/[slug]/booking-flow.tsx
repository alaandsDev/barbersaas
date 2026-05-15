"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, ChevronRight, CalendarDays, Clock, ArrowLeft, CheckCircle2, ShieldCheck, Bell, MessageCircle, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatBRL, cn, fmtBrDateTime } from "@/lib/utils";
import { getAvailableSlots, bookPublicAppointment, type SlotInfo } from "./actions";

type Service = { id: string; name: string; priceCents: number; durationMinutes: number };
type Pro = { id: string; name: string };

function maskPhoneBR(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function buildGcalUrl({ title, start, end, details, location }: { title: string; start: Date; end: Date; details?: string; location?: string }) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
  });
  if (details) params.set("details", details);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function BookingFlow({ businessId, services, professionals, brandColor = "#0f172a", businessName = "" }: { businessId: string; services: Service[]; professionals: Pro[]; brandColor?: string; businessName?: string }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | "done">(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  const service = services.find((s) => s.id === serviceId) ?? null;
  const professional = professionals.find((p) => p.id === professionalId) ?? null;

  useEffect(() => {
    if (step !== 3 || !serviceId || !professionalId) return;
    setLoadingSlots(true);
    setSlot(null);
    getAvailableSlots({ businessId, serviceId, professionalId, date })
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [step, businessId, serviceId, professionalId, date]);

  function confirm() {
    if (!serviceId || !professionalId || !slot) return;
    startTransition(async () => {
      const res = await bookPublicAppointment({
        businessId, serviceId, professionalId,
        startsAt: slot,
        customerName: name, customerPhone: phone, customerEmail: email,
      });
      if (!res.ok) toast.error(res.error);
      else setStep("done");
    });
  }

  if (step === "done" && slot && service && professional) {
    const d = new Date(slot);
    const end = new Date(d.getTime() + service.durationMinutes * 60_000);
    const eventTitle = `${service.name} — ${businessName}`;
    const gcal = buildGcalUrl({ title: eventTitle, start: d, end, details: `Profissional: ${professional.name}`, location: businessName });
    const wppMsg = encodeURIComponent(`Acabei de agendar ${service.name} em ${businessName} no dia ${fmtBrDateTime(d)}. ${typeof window !== "undefined" ? window.location.href : ""}`);

    return (
      <Card className="card-elevated p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Agendamento confirmado!</h1>
        <p className="mt-2 text-sm text-slate-600">Te esperamos no horário marcado. Em caso de imprevisto, entre em contato com a barbearia.</p>

        <div className="mx-auto mt-6 max-w-xs space-y-2 rounded-xl border bg-slate-50 p-4 text-left text-sm">
          <Row label="Serviço" value={service.name} />
          <Row label="Profissional" value={professional.name} />
          <Row label="Quando" value={fmtBrDateTime(d)} />
          <Row label="Valor" value={formatBRL(service.priceCents)} />
        </div>

        <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2">
          <a
            href={gcal}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <CalendarPlus className="h-4 w-4" /> Adicionar ao Google Calendar
          </a>
          <a
            href={`https://wa.me/?text=${wppMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <MessageCircle className="h-4 w-4" /> Compartilhar no WhatsApp
          </a>
        </div>

        {email && (
          <p className="mt-5 inline-flex items-center gap-1 text-xs text-emerald-700">
            <Bell className="h-3 w-3" /> Confirmação enviada para {email}
          </p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6" style={{ ["--brand" as any]: brandColor }}>
      <Steps current={step as 1 | 2 | 3 | 4} />

      {step === 1 && (
        <Card className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Escolha o serviço</h2>
            <span className="text-xs text-slate-500">{services.length} disponíveis</span>
          </div>
          <div className="mt-4 space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => { setServiceId(s.id); setStep(2); }}
                className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all hover:border-[var(--brand)] hover:bg-muted/50"
              >
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" /> {s.durationMinutes} min</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold">{formatBRL(s.priceCents)}</div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="card-elevated p-5">
          <BackBtn onClick={() => setStep(1)} />
          <h2 className="mt-2 text-base font-semibold">Escolha o profissional</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {professionals.map((p) => (
              <button
                key={p.id}
                onClick={() => { setProfessionalId(p.id); setStep(3); }}
                className="flex items-center justify-between rounded-lg border p-3 text-left transition-all hover:border-[var(--brand)] hover:bg-muted/50"
              >
                <div className="font-medium">{p.name}</div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {step === 3 && service && professional && (
        <Card className="card-elevated p-5">
          <BackBtn onClick={() => setStep(2)} />
          <h2 className="mt-2 text-base font-semibold">Escolha data e horário</h2>

          <div className="mt-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <Input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto"
            />
          </div>

          <div className="mt-4">
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => <div key={i} className="shimmer h-10 rounded-md" />)}
              </div>
            ) : slots.length === 0 || slots.every((s) => !s.available) ? (
              <p className="text-sm text-slate-500">Sem horários disponíveis nessa data. Tente outro dia.</p>
            ) : (
              <>
                <div className="mb-2 text-xs text-slate-500">{slots.filter((s) => s.available).length} horários disponíveis</div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {slots.map((s, idx) => {
                    const firstAvailable = idx === slots.findIndex((x) => x.available);
                    return (
                      <button
                        key={s.iso}
                        disabled={!s.available}
                        onClick={() => { setSlot(s.iso); setStep(4); }}
                        className={cn(
                          "relative rounded-md border px-3 py-2 text-sm font-medium transition-all",
                          s.available
                            ? "hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white"
                            : "cursor-not-allowed bg-muted text-muted-foreground line-through"
                        )}
                      >
                        {s.label}
                        {firstAvailable && s.available && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            PRÓXIMO
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {step === 4 && service && professional && slot && (
        <Card className="card-elevated p-5">
          <BackBtn onClick={() => setStep(3)} />
          <h2 className="mt-2 text-base font-semibold">Quase lá! Seus dados</h2>

          <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-sm">
            <Row label="Serviço" value={service.name} />
            <Row label="Profissional" value={professional.name} />
            <Row label="Quando" value={fmtBrDateTime(new Date(slot))} />
            <Row label="Valor" value={formatBRL(service.priceCents)} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); confirm(); }} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (com WhatsApp)</Label>
              <Input
                id="phone" required
                value={phone}
                onChange={(e) => setPhone(maskPhoneBR(e.target.value))}
                placeholder="(11) 99999-9999"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-xs font-normal text-muted-foreground">(receba confirmação)</span></Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <Button
              type="submit" disabled={pending} className="w-full text-white"
              style={{ background: "var(--brand)" }}
            >
              {pending ? "Confirmando..." : <>Confirmar agendamento <Check className="h-4 w-4" /></>}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3 w-3 text-emerald-600" /> Reserva instantânea · Você pode cancelar
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const labels = ["Serviço", "Profissional", "Horário", "Confirmar"];
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4;
        const active = n === current;
        const done = n < current;
        return (
          <div key={l} className="flex flex-1 items-center gap-2">
            <div className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
              done ? "bg-emerald-600 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            <div className={cn("hidden text-xs font-medium sm:block", active ? "text-foreground" : "text-muted-foreground")}>{l}</div>
            {i < labels.length - 1 && <div className={cn("h-px flex-1", done ? "bg-emerald-600" : "bg-border")} />}
          </div>
        );
      })}
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900">
      <ArrowLeft className="h-3 w-3" /> Voltar
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium capitalize">{value}</span>
    </div>
  );
}
