"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createAppointment } from "./actions";

type Option = { id: string; name: string };

export function NewAppointmentForm(props: {
  professionals: Option[];
  services: Option[];
  customers: Option[];
}) {
  const [pending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAppointment(fd);
      if (!res.ok) toast.error(res.error);
      else { toast.success("Agendamento criado"); setFormKey((k) => k + 1); }
    });
  }

  const empty = props.professionals.length === 0 || props.services.length === 0 || props.customers.length === 0;

  if (empty) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 text-sm text-amber-900">
          Antes de agendar, cadastre pelo menos 1 profissional, 1 serviço e 1 cliente.
        </CardContent>
      </Card>
    );
  }

  const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <Card>
      <CardContent className="p-4">
        <form key={formKey} onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
          <select name="professionalId" required className={selectCls}>
            <option value="">Profissional</option>
            {props.professionals.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select name="serviceId" required className={selectCls}>
            <option value="">Serviço</option>
            {props.services.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select name="customerId" required className={selectCls}>
            <option value="">Cliente</option>
            {props.customers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <Input name="startsAt" required type="datetime-local" />
          <Button type="submit" variant="accent" disabled={pending}>
            {pending ? "..." : "Agendar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
