import Link from "next/link";
import { PLANS, type PlanKey } from "@/lib/stripe";

const features = [
  { title: "Agenda inteligente", body: "Sem conflito de horários, com lembretes automáticos para seus clientes." },
  { title: "Controle financeiro", body: "Veja o caixa do dia em tempo real, por profissional e por serviço." },
  { title: "Gestão de equipe", body: "Cada profissional com sua agenda, comissão e serviços executados." },
];

const problems = [
  { title: "Agenda no papel?", body: "Você perde tempo, perde cliente e perde dinheiro." },
  { title: "Clientes faltando?", body: "Sem lembrete automático, no-show é regra." },
  { title: "Desorganização?", body: "Cada barbeiro com sua planilha = caos no fim do mês." },
];

const solutions = [
  { title: "Agenda automática", body: "Cliente marca sozinho, você só atende." },
  { title: "Clientes organizados", body: "Histórico, telefone e preferências em 1 clique." },
  { title: "Mais lucro", body: "Reduza buracos na agenda e aumente o ticket médio." },
];

const faq = [
  { q: "Posso cancelar quando quiser?", a: "Sim. Cancele em 1 clique pelo painel de cobrança — sem fidelidade, sem multa." },
  { q: "Como funciona o pagamento?", a: "Cobrança mensal recorrente no cartão via Stripe. Você recebe nota fiscal por email." },
  { q: "Preciso instalar algo?", a: "Não. É 100% web — funciona no celular, tablet ou computador, basta um navegador." },
  { q: "Como funciona o suporte?", a: "Suporte por email em até 24h. Plano Pro tem prioridade." },
  { q: "Meus dados estão seguros?", a: "Sim. Banco em servidores criptografados (Supabase) e pagamentos via Stripe — mesmo nível de bancos." },
];

export default function Home() {
  const order: PlanKey[] = ["BASIC", "PRO", "PREMIUM"];

  return (
    <main>
      {/* HEADER */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-bold">BarberOS</div>
        <nav className="flex gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-100">Entrar</Link>
          <Link href="/signup" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90">Começar grátis</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          A forma mais simples de gerenciar sua barbearia
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
          Agenda, clientes, equipe e financeiro em um só lugar. Comece grátis em 2 minutos.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-brand-accent px-8 py-4 text-base font-semibold text-white shadow-lg hover:opacity-90"
        >
          👉 Começar grátis
        </Link>
        <p className="mt-4 text-xs text-slate-500">Sem cartão de crédito • Cancele quando quiser</p>
      </section>

      {/* PROBLEMA */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Cansado disso?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {problems.map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold">❌ {p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">A solução: BarberOS</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {solutions.map((s) => (
              <div key={s.title} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <h3 className="text-lg font-semibold">✅ {s.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Tudo o que sua barbearia precisa</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Planos</h2>
          <p className="mt-2 text-center text-slate-600">Comece grátis. Pague só quando precisar.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {order.map((key) => {
              const p = PLANS[key];
              return (
                <div key={key} className={`rounded-2xl border p-6 ${p.popular ? "border-brand-accent shadow-xl" : "border-slate-200"}`}>
                  {p.popular && (
                    <div className="mb-2 inline-block rounded-full bg-brand-accent px-3 py-1 text-xs font-bold text-white">MAIS POPULAR</div>
                  )}
                  <div className="text-xl font-semibold">{p.name}</div>
                  <div className="mt-2 text-3xl font-bold">{p.priceBRL}<span className="text-base font-normal text-slate-500">/mês</span></div>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {p.features.map((x) => <li key={x}>✓ {x}</li>)}
                  </ul>
                  <Link href="/signup" className="mt-6 block rounded-lg bg-brand py-2 text-center text-sm font-semibold text-white hover:opacity-90">
                    Começar
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-brand py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold">Teste grátis hoje.</h2>
          <p className="mt-3 text-lg text-slate-200">Em 2 minutos você está com a agenda da sua barbearia organizada.</p>
          <Link href="/signup" className="mt-8 inline-block rounded-xl bg-brand-accent px-8 py-4 text-base font-semibold text-white shadow-lg hover:opacity-90">
            Quero começar agora →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-10 space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="rounded-xl border border-slate-200 p-5">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-3 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} BarberOS — feito para barbearias modernas.
      </footer>
    </main>
  );
}
