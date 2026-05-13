# BarberOS

SaaS de gestão para barbearias e salões. Multi-tenant, com agenda, clientes, equipe, financeiro e billing recorrente via Stripe.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** + shadcn/ui (a adicionar conforme demanda)
- **Prisma** + **PostgreSQL** (Supabase)
- **Supabase Auth** (email/senha + OAuth)
- **Stripe** (assinaturas + billing portal + webhooks)
- **React Query** + **Zustand**

## Roadmap

- [x] **Fase 0** — Scaffold (Next.js, Tailwind, Prisma schema, Supabase client, landing inicial)
- [ ] **Fase 1** — Auth Supabase + middleware multi-tenant
- [ ] **Fase 2** — MVP CRUD: serviços, profissionais, clientes, agenda (com checagem de conflito), dashboard
- [ ] **Fase 3** — Stripe (planos Basic/Pro/Premium, checkout, webhooks, gating por assinatura)
- [ ] **Fase 4** — Landing conversiva + onboarding completo
- [ ] **Fase 5** — Growth loop (indicação)

## Setup local

```bash
npm install
cp .env.example .env.local        # preencher variáveis (Supabase, Stripe, DB)
npm run db:generate
npm run db:push                   # aplica schema no Postgres
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

Veja `.env.example`. Necessário:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Database**: `DATABASE_URL`, `DIRECT_URL` (use a connection string Postgres do projeto Supabase — pooler na primeira, direta na segunda)
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, e os 3 `STRIPE_PRICE_*`

## Arquitetura multi-tenant

- Cada `Business` é um **tenant**. Toda entidade do negócio (Service, Customer, Appointment...) carrega `businessId`.
- `Membership` liga `User` ↔ `Business` com `Role` (OWNER, ADMIN, PROFESSIONAL).
- Um usuário pode pertencer a vários `Business`. O middleware seleciona o tenant ativo (cookie/subdomínio — a definir na Fase 1).
- `Subscription` é 1:1 com `Business`. Middleware bloqueia rotas do app se `status` ≠ `ACTIVE`/`TRIALING`.

## Deploy

- **Frontend + API**: Vercel
- **DB**: Supabase
- **Webhooks Stripe**: rota `app/api/webhooks/stripe` (Fase 3)

## Status atual

🟢 Fase 0 entregue — projeto compila, landing inicial no `/`. Próximo passo: Fase 1 (auth).
