"use client";

import { useState, useTransition } from "react";
import { createAppointment } from "./actions";

type Option = { id: string; name: string };

export function NewAppointmentForm(props: {
  professionals: Option[];
  services: Option[];
  customers: Option[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAppointment(fd);
      if (!res.ok) setError(res.error);
      else (e.target as HTMLFormElement).reset();
    });
  }

  const empty = props.professionals.length === 0 || props.services.length === 0 || props.customers.length === 0;

  if (empty) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Antes de agendar, cadastre pelo menos 1 profissional, 1 serviço e 1 cliente.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
      <select name="professionalId" required className="rounded-lg border border-slate-300 px-3 py-2">
        <option value="">Profissional</option>
        {props.professionals.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <select name="serviceId" required className="rounded-lg border border-slate-300 px-3 py-2">
        <option value="">Serviço</option>
        {props.services.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <select name="customerId" required className="rounded-lg border border-slate-300 px-3 py-2">
        <option value="">Cliente</option>
        {props.customers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
      <input name="startsAt" required type="datetime-local" className="rounded-lg border border-slate-300 px-3 py-2" />
      <button disabled={pending} className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
        {pending ? "..." : "Agendar"}
      </button>
      {error && <p className="md:col-span-5 text-sm text-red-600">{error}</p>}
    </form>
  );
}
