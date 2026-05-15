"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAppointment } from "./actions";

type Option = { id: string; name: string };

export function EditAppointmentButton({ appointment, professionals, services }: {
  appointment: { id: string; startsAtLocal: string; serviceId: string; professionalId: string };
  professionals: Option[];
  services: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateAppointment(fd);
      if (!res.ok) toast.error(res.error);
      else { toast.success("Agendamento atualizado"); setOpen(false); }
    });
  }

  const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      <Button type="button" variant="ghost" size="icon" title="Editar" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 text-blue-600" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="card-floating w-full max-w-md rounded-xl border bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Editar agendamento</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={appointment.id} />

              <div className="space-y-2">
                <Label htmlFor="professionalId">Profissional</Label>
                <select id="professionalId" name="professionalId" required defaultValue={appointment.professionalId} className={selectCls}>
                  {professionals.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceId">Serviço</Label>
                <select id="serviceId" name="serviceId" required defaultValue={appointment.serviceId} className={selectCls}>
                  {services.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startsAt">Data e hora</Label>
                <Input id="startsAt" name="startsAt" type="datetime-local" required defaultValue={appointment.startsAtLocal} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
