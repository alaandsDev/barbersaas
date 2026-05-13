import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, ensureLocalUser, getTenantContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const nav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/agenda", label: "Agenda" },
  { href: "/app/clientes", label: "Clientes" },
  { href: "/app/profissionais", label: "Profissionais" },
  { href: "/app/servicos", label: "Serviços" },
  { href: "/app/indicacoes", label: "Indique e ganhe" },
  { href: "/app/billing", label: "Plano & Cobrança" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await ensureLocalUser(user);
  const ctx = await getTenantContext();
  if (!ctx) redirect("/onboarding");

  const business = await prisma.business.findUnique({
    where: { id: ctx.businessId },
    include: { subscription: true },
  });

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="border-r border-slate-200 bg-slate-50 p-4">
        <div className="mb-1 text-lg font-bold">BarberOS</div>
        <div className="mb-6 truncate text-xs text-slate-500">{business?.name}</div>
        <nav className="space-y-1 text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-md px-3 py-2 hover:bg-slate-200">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action="/auth/signout" method="post" className="mt-8">
          <button className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-white">Sair</button>
        </form>
      </aside>
      <main className="p-8">{children}</main>
    </div>
  );
}
