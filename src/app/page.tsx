import Link from "next/link";
import { ArrowRight, Calendar, DollarSign, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLANS, type PlanKey } from "@/lib/stripe";

const features = [
  { icon: Calendar, title: "Agenda inteligente", body: "Sem conflito de horários, com lembretes automáticos para seus clientes." },
  { icon: DollarSign, title: "Controle financeiro", body: "Veja o caixa do dia em tempo real, por profissional e por serviço." },
  { icon: Users, title: "Gestão de equipe", body: "Cada profissional com sua agenda, comissão e serviços executados." },
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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-bold">BarberOS</div>
        <nav className="flex gap-2">
          <Button asChild variant="ghost"><Link href="/login">Entrar</Link></Button>
          <Button asChild><Link href="/signup">Começar grátis</Link></Button>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          A forma mais simples de gerenciar sua barbearia
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Agenda, clientes, equipe e financeiro em um só lugar. Comece grátis em 2 minutos.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" variant="accent">
            <Link href="/signup">Começar grátis <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">3 dias grátis • Sem cartão de crédito • Cancele quando quiser</p>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Cansado disso?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {problems.map((p) => (
              <Card key={p.title}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <X className="mt-0.5 h-5 w-5 text-destructive" />
                    <div>
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">A solução: BarberOS</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {solutions.map((s) => (
              <Card key={s.title} className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div>
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      <p className="mt-2 text-sm text-emerald-900">{s.body}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Tudo o que sua barbearia precisa</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardContent className="p-6">
                  <f.icon className="mb-3 h-6 w-6 text-accent" />
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Planos</h2>
          <p className="mt-2 text-center text-muted-foreground">Comece grátis. Pague só quando precisar.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {order.map((key) => {
              const p = PLANS[key];
              return (
                <Card key={key} className={p.popular ? "border-accent shadow-xl" : ""}>
                  <CardContent className="p-6">
                    {p.popular && (
                      <div className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                        MAIS POPULAR
                      </div>
                    )}
                    <div className="text-xl font-semibold">{p.name}</div>
                    <div className="mt-2 text-3xl font-bold">{p.priceBRL}<span className="text-base font-normal text-muted-foreground">/mês</span></div>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {p.features.map((x) => (
                        <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> {x}</li>
                      ))}
                    </ul>
                    <Button asChild className="mt-6 w-full"><Link href="/signup">Começar</Link></Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold">Teste grátis hoje.</h2>
          <p className="mt-3 text-lg text-primary-foreground/80">Em 2 minutos você está com a agenda da sua barbearia organizada.</p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="accent">
              <Link href="/signup">Quero começar agora <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-10 space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="rounded-xl border p-5">
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BarberOS — feito para barbearias modernas.
      </footer>
    </main>
  );
}
