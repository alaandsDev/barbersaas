import Link from "next/link";
import { ArrowRight, Calendar, DollarSign, Users, Check, Quote, Zap, ShieldCheck, Smartphone, BarChart3, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { StatsStrip } from "@/components/landing/stats-strip";
import { Comparison } from "@/components/landing/comparison";
import { RoiCalculator } from "@/components/landing/roi-calculator";
import { StickyCta } from "@/components/landing/sticky-cta";
import { PLANS, type PlanKey } from "@/lib/stripe";

const features = [
  { icon: Calendar, title: "Agenda online 24/7", body: "Cliente marca pelo Instagram, WhatsApp ou Google sem te ligar. Você só atende.", outcome: "Reduz 80% das ligações" },
  { icon: DollarSign, title: "Financeiro em tempo real", body: "Caixa do dia, comissão por barbeiro e relatórios automáticos. Tudo no celular.", outcome: "Economiza 5h/semana" },
  { icon: Users, title: "CRM de clientes", body: "Histórico, telefone, preferências. Saiba quem é VIP e quem está sumindo.", outcome: "+30% retenção" },
  { icon: BarChart3, title: "Dashboards visuais", body: "Receita, ocupação, ranking de profissionais. Decida com dados, não no chute.", outcome: "+20% lucro/barbeiro" },
  { icon: Smartphone, title: "100% mobile", body: "Funciona no celular, tablet ou computador. Sem instalar nada.", outcome: "Use de qualquer lugar" },
  { icon: ShieldCheck, title: "Lembretes automáticos", body: "Cliente recebe email no dia. Não esquece, não falta, não cancela em cima.", outcome: "Reduz no-show pra 5%" },
];

const steps = [
  { n: 1, title: "Crie sua conta grátis", body: "Em 2 minutos. Sem cartão de crédito.", time: "2 min" },
  { n: 2, title: "Cadastre serviços e equipe", body: "Configure preços, durações e profissionais.", time: "3 min" },
  { n: 3, title: "Compartilhe seu link", body: "Cole no Instagram, Google e WhatsApp. Clientes começam a marcar.", time: "agora" },
];

const testimonials = [
  {
    name: "Diego Martins",
    role: "Owner · Barbearia Clube",
    body: "Em 2 meses, cortei no-show em 30% e meu caixa cresceu R$ 3.200/mês só com isso. O sistema se paga sozinho na primeira semana.",
    metric: "+R$ 3.200/mês",
    stars: 5,
  },
  {
    name: "Lucas Tavares",
    role: "Owner · Studio Tavares",
    body: "Tinha 4 barbeiros e era um caos calcular comissão. Agora abro o relatório no domingo e em 2 minutos pago todo mundo. Vida nova.",
    metric: "5h/semana economizadas",
    stars: 5,
  },
  {
    name: "Marcelo Brito",
    role: "Owner · Brito Cuts",
    body: "Coloquei o link no Instagram e em 1 mês tive 80% dos agendamentos online. Meu telefone parou de tocar e meu lucro subiu.",
    metric: "+R$ 2.800/mês",
    stars: 5,
  },
];

const faq = [
  { q: "Posso cancelar quando quiser?", a: "Sim. Cancele em 1 clique pelo painel de cobrança — sem fidelidade, sem multa. Garantimos 7 dias pra você decidir." },
  { q: "Como funciona o teste grátis?", a: "São 3 dias com acesso completo a qualquer plano. Sem precisar cadastrar cartão. Se gostar, escolhe o plano e pronto." },
  { q: "Como funciona o pagamento?", a: "Cobrança mensal recorrente no cartão via Stripe. Você recebe nota fiscal por email." },
  { q: "Preciso instalar algo?", a: "Não. É 100% web — funciona no celular, tablet ou computador, basta um navegador." },
  { q: "E o suporte?", a: "Suporte por email em até 24h. Plano Pro e Premium têm prioridade com resposta em até 4h." },
  { q: "Meus dados estão seguros?", a: "Sim. Banco criptografado (Supabase), pagamentos via Stripe — mesmo nível de bancos. LGPD compliant." },
  { q: "Funciona pra salão de beleza, manicure, estética?", a: "Sim. BarberOS é otimizado pra barbearias mas funciona perfeitamente pra qualquer negócio com horário marcado." },
];

const fakeBrands = ["Studio Tavares", "Brito Cuts", "Barbearia Clube", "Premium Cuts", "Studio MM", "Barber Lab"];

export default function Home() {
  const order: PlanKey[] = ["BASIC", "PRO", "PREMIUM"];

  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <StatsStrip />

        {/* LOGOS */}
        <section className="border-b bg-white py-10">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              Barbearias que já confiam no BarberOS
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 md:grid-cols-6">
              {fakeBrands.map((b) => (
                <div key={b} className="text-center text-sm font-bold uppercase tracking-wider text-slate-400">{b}</div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES com outcome */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Tudo o que você precisa"
              title="Uma plataforma. Sua barbearia inteira."
              subtitle="Pare de pular entre WhatsApp, planilha e caderno. Centralize tudo — e veja o lucro subir."
            />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card key={f.title} className="card-elevated p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 ring-1 ring-amber-200">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">{f.outcome}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Comparison />
        <RoiCalculator />

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Como funciona"
              title="Do zero ao primeiro agendamento em 5 minutos"
            />
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="relative">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{s.n}</div>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">{s.time}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS com $$$ */}
        <section className="bg-gradient-to-b from-white to-slate-50 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Resultados reais"
              title="Donos de barbearia que faturam mais"
            />
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="card-elevated relative p-6">
                  <div className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    {t.metric}
                  </div>
                  <div className="mt-2 flex">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="mt-3 h-5 w-5 text-amber-400" />
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">"{t.body}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <Avatar name={t.name} />
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="planos" className="bg-white py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Planos"
              title="Comece grátis. Pague só quando precisar."
              subtitle="3 dias grátis em qualquer plano. Sem cartão de crédito. Cancele quando quiser."
            />

            {/* Garantia */}
            <div className="mx-auto mt-6 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              Garantia incondicional de 7 dias — devolvemos seu dinheiro
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {order.map((key) => {
                const p = PLANS[key];
                return (
                  <Card key={key} className={`relative p-8 ${p.popular ? "card-floating border-primary/20 ring-2 ring-primary/10" : "card-elevated"}`}>
                    {p.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-950">
                        Mais Popular
                      </div>
                    )}
                    <div className="text-sm font-semibold uppercase tracking-wider text-slate-500">{p.name}</div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">{p.priceBRL}</span>
                      <span className="text-sm text-slate-500">/mês</span>
                    </div>
                    <ul className="mt-6 space-y-3 text-sm">
                      {p.features.map((x) => (
                        <li key={x} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {x}
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant={p.popular ? "accent" : "default"} className="mt-8 w-full">
                      <Link href="/signup">Começar grátis</Link>
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="card-floating relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[hsl(230,60%,22%)] p-12 text-center text-white md:p-20">
              <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(circle_at_top,_hsl(38_95%_70%/.6),_transparent_60%)]" />
              <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
                <TrendingUp className="h-3 w-3" /> Junte-se a +200 barbearias
              </div>
              <h2 className="text-balance mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Cada dia sem BarberOS é dinheiro perdido.
              </h2>
              <p className="text-balance mx-auto mt-4 max-w-xl text-base text-white/70 md:text-lg">
                Em 2 minutos você está com a agenda no ar e os clientes marcando sozinhos. 3 dias grátis.
              </p>
              <div className="mt-8 flex justify-center">
                <Button asChild size="lg" variant="accent" className="h-12 px-8 text-base shadow-2xl">
                  <Link href="/signup">Começar agora <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
              <p className="mt-3 text-xs text-white/50">Sem cartão · Cancele quando quiser · Garantia 7 dias</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white py-24">
          <div className="mx-auto max-w-3xl px-6">
            <SectionHeading
              eyebrow="FAQ"
              title="Perguntas frequentes"
            />
            <div className="mt-12 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {faq.map((f) => (
                <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between font-medium">
                    {f.q}
                    <span className="ml-2 grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-lg leading-none text-slate-600 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row">
            <div>© {new Date().getFullYear()} BarberOS — feito para barbearias modernas.</div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="hover:text-slate-900">Entrar</Link>
              <span>·</span>
              <Link href="/signup" className="hover:text-slate-900">Criar conta</Link>
            </div>
          </div>
        </footer>

        <StickyCta />
      </main>
    </>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">{eyebrow}</div>
      <h2 className="text-balance mx-auto mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="text-balance mx-auto mt-4 max-w-xl text-slate-600">{subtitle}</p>}
    </div>
  );
}
