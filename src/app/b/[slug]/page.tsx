import { notFound } from "next/navigation";
import { Scissors, Clock, Calendar as CalIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { BookingFlow } from "./booking-flow";

export const dynamic = "force-dynamic";

export default async function PublicBookingPage({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    include: {
      subscription: true,
      services: { where: { active: true }, orderBy: { name: "asc" } },
      professionals: { where: { active: true }, orderBy: { name: "asc" } },
    },
  });
  if (!business) notFound();

  const sub = business.subscription;
  const subOk = sub && (sub.status === "ACTIVE" || sub.status === "TRIALING");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Scissors className="h-4 w-4" />
          </div>
          <div>
            <div className="text-base font-bold leading-none">{business.name}</div>
            <div className="mt-1 text-xs text-slate-500">Agende online em segundos</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {!subOk ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <h1 className="text-lg font-semibold">Agenda temporariamente indisponível</h1>
            <p className="mt-2 text-sm">Volte mais tarde ou entre em contato com a barbearia.</p>
          </div>
        ) : business.services.length === 0 || business.professionals.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h1 className="text-lg font-semibold">Agenda em configuração</h1>
            <p className="mt-2 text-sm text-slate-600">A barbearia ainda está cadastrando serviços e profissionais. Volte em breve.</p>
          </div>
        ) : (
          <BookingFlow
            businessId={business.id}
            services={business.services.map((s) => ({
              id: s.id, name: s.name, priceCents: s.priceCents, durationMinutes: s.durationMinutes,
            }))}
            professionals={business.professionals.map((p) => ({ id: p.id, name: p.name }))}
          />
        )}

        <p className="mt-10 text-center text-xs text-slate-400">
          Agendado por <span className="font-semibold">BarberOS</span> · Tecnologia para barbearias
        </p>
      </main>
    </div>
  );
}

// helpers usados no preview da lista
export function ServicePreview({ name, priceCents, durationMinutes }: { name: string; priceCents: number; durationMinutes: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <div className="font-medium">{name}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" /> {durationMinutes} min</div>
      </div>
      <div className="text-sm font-semibold">{formatBRL(priceCents)}</div>
    </div>
  );
}

// suprime warning de export não usado quando alguém importá-lo
export const _icons = { CalIcon };
