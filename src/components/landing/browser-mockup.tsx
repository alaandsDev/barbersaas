import { Calendar, Scissors, Users, LayoutDashboard, BadgeDollarSign, UserCog, Gift } from "lucide-react";

const sampleAppointments = [
  { time: "09:00", customer: "Lucas Almeida", service: "Corte + Barba", pro: "Diego", price: "R$ 75,00" },
  { time: "10:30", customer: "Marcelo Souza", service: "Corte masculino", pro: "Tiago", price: "R$ 45,00" },
  { time: "11:15", customer: "Pedro Henrique", service: "Pigmentação", pro: "Diego", price: "R$ 120,00" },
  { time: "13:00", customer: "André Lima", service: "Barba", pro: "Tiago", price: "R$ 35,00" },
  { time: "14:30", customer: "Rodrigo Vieira", service: "Corte + Barba", pro: "Diego", price: "R$ 75,00" },
];

export function BrowserMockup() {
  return (
    <div className="card-floating relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* browser chrome */}
      <div className="flex items-center justify-between border-b bg-slate-50/80 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-rose-300" />
          <div className="h-3 w-3 rounded-full bg-amber-300" />
          <div className="h-3 w-3 rounded-full bg-emerald-300" />
        </div>
        <div className="rounded-md bg-white px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">app.barberos.com/agenda</div>
        <div className="w-12" />
      </div>

      {/* app */}
      <div className="grid grid-cols-[180px_1fr]">
        {/* sidebar */}
        <div className="bg-[hsl(230,50%,11%)] p-3 text-[hsl(220,14%,88%)]">
          <div className="mb-4 flex items-center gap-2 px-2 pt-1">
            <div className="grid h-6 w-6 place-items-center rounded bg-amber-400 text-amber-950"><Scissors className="h-3 w-3" /></div>
            <span className="text-sm font-bold text-white">BarberOS</span>
          </div>
          {[
            { icon: LayoutDashboard, label: "Dashboard" },
            { icon: Calendar, label: "Agenda", active: true },
            { icon: Users, label: "Clientes" },
            { icon: UserCog, label: "Profissionais" },
            { icon: Scissors, label: "Serviços" },
            { icon: Gift, label: "Indicações" },
            { icon: BadgeDollarSign, label: "Cobrança" },
          ].map((n) => (
            <div key={n.label} className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs ${n.active ? "bg-[hsl(230,60%,18%)] text-white" : ""}`}>
              <n.icon className={`h-3 w-3 ${n.active ? "text-amber-400" : "text-[hsl(220,9%,60%)]"}`} />
              <span>{n.label}</span>
            </div>
          ))}
        </div>

        {/* content */}
        <div className="p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-base font-bold">Agenda</h3>
              <p className="text-xs text-slate-500">terça-feira, 13 de maio</p>
            </div>
            <div className="rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-950">+ Agendar</div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-white text-xs">
            <div className="grid grid-cols-[60px_1fr_1fr_80px_70px] gap-3 border-b bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <div>Hora</div><div>Cliente</div><div>Serviço</div><div>Prof.</div><div className="text-right">Valor</div>
            </div>
            {sampleAppointments.map((a) => (
              <div key={a.time} className="grid grid-cols-[60px_1fr_1fr_80px_70px] gap-3 border-b px-3 py-2.5 last:border-0">
                <div className="font-medium">{a.time}</div>
                <div>{a.customer}</div>
                <div className="text-slate-500">{a.service}</div>
                <div className="text-slate-500">{a.pro}</div>
                <div className="text-right font-medium">{a.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
