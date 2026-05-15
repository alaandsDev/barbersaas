import { X, Check } from "lucide-react";

const rows = [
  { item: "Agendamento", before: "Cliente liga, você anota no caderno", after: "Cliente marca sozinho pelo link", winner: "after" as const },
  { item: "Lembrete", before: "Você esquece de avisar", after: "Email automático antes do horário", winner: "after" as const },
  { item: "No-show", before: "15% dos horários perdidos", after: "Reduzido para ~5%", winner: "after" as const },
  { item: "Comissão dos barbeiros", before: "Calculadora + Excel toda semana", after: "Relatório automático em 1 clique", winner: "after" as const },
  { item: "Receita do dia", before: "Conta no caixa, anota no caderno", after: "Dashboard em tempo real no celular", winner: "after" as const },
  { item: "Histórico do cliente", before: "Memória do barbeiro", after: "Cada cliente com ficha completa", winner: "after" as const },
  { item: "Backup dos dados", before: "Caderno some, perdeu tudo", after: "Tudo na nuvem, criptografado", winner: "after" as const },
];

export function Comparison() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Antes vs Depois</div>
          <h2 className="text-balance mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            A diferença é absurda
          </h2>
        </div>

        <div className="card-floating mt-12 overflow-hidden rounded-2xl border bg-white">
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b bg-muted/30">
            <div className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"></div>
            <div className="border-l px-5 py-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-600">Sem BarberOS</div>
              <div className="mt-1 text-sm text-slate-500">Caderno, planilha, ligação</div>
            </div>
            <div className="border-l bg-emerald-50/50 px-5 py-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Com BarberOS</div>
              <div className="mt-1 text-sm text-slate-700">Tudo automático</div>
            </div>
          </div>
          {rows.map((r, i) => (
            <div key={r.item} className={`grid grid-cols-[1fr_1fr_1fr] ${i < rows.length - 1 ? "border-b" : ""}`}>
              <div className="px-5 py-4 text-sm font-medium">{r.item}</div>
              <div className="flex items-start gap-2 border-l px-5 py-4 text-sm text-slate-600">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{r.before}</span>
              </div>
              <div className="flex items-start gap-2 border-l bg-emerald-50/30 px-5 py-4 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{r.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
