import { notFound } from "next/navigation";
import { Scissors, Phone, Users, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { addDays, startOfBrDay } from "@/lib/utils";
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
  const brand = business.brandColor ?? "#0f172a";

  // Social proof: agendamentos da última semana
  const weekAgo = addDays(startOfBrDay(new Date()), -7);
  const weeklyCount = await prisma.appointment.count({
    where: {
      businessId: business.id,
      status: { in: ["SCHEDULED", "COMPLETED"] },
      createdAt: { gte: weekAgo },
    },
  });

  return (
    <div className="min-h-screen">
      {/* COVER */}
      <div
        className="relative h-44 w-full"
        style={{ background: `linear-gradient(135deg, ${brand} 0%, ${shade(brand, -25)} 100%)` }}
      >
        <div className="absolute inset-0 [background:radial-gradient(circle_at_top_right,rgba(255,255,255,.18),transparent_60%)]" />
        {business.coverEmoji && (
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-30">{business.coverEmoji}</div>
        )}
      </div>

      <div className="mx-auto -mt-12 max-w-2xl px-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-sm"
              style={{ background: brand }}
            >
              {business.coverEmoji ? (
                <span className="text-2xl">{business.coverEmoji}</span>
              ) : (
                <Scissors className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="truncate text-xl font-bold">{business.name}</h1>
              {business.bio && <p className="mt-1 text-sm text-slate-600">{business.bio}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {business.phone && (
                  <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {business.phone}</span>
                )}
                <span className="inline-flex items-center gap-1">
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  4.9
                </span>
              </div>
            </div>
          </div>
          {weeklyCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <Users className="h-3 w-3" />
              {weeklyCount} {weeklyCount === 1 ? "agendamento" : "agendamentos"} essa semana
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {!subOk ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <h2 className="text-lg font-semibold">Agenda temporariamente indisponível</h2>
            <p className="mt-2 text-sm">Volte mais tarde ou entre em contato com a barbearia.</p>
          </div>
        ) : business.services.length === 0 || business.professionals.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Agenda em configuração</h2>
            <p className="mt-2 text-sm text-slate-600">A barbearia ainda está cadastrando serviços e profissionais. Volte em breve.</p>
          </div>
        ) : (
          <BookingFlow
            businessId={business.id}
            businessName={business.name}
            brandColor={brand}
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

// shade simples: positive lighten, negative darken (em %)
function shade(hex: string, percent: number) {
  const f = parseInt(hex.replace("#", ""), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16, G = (f >> 8) & 0x00ff, B = f & 0x0000ff;
  const r = Math.round((t - R) * p) + R;
  const g = Math.round((t - G) * p) + G;
  const b = Math.round((t - B) * p) + B;
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
