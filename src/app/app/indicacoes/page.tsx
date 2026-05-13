import { requireUser, ensureLocalUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CopyLink } from "./copy-link";

export default async function IndicacoesPage() {
  const u = await requireUser();
  await ensureLocalUser(u);
  const user = await prisma.user.findUnique({
    where: { id: u.id },
    include: { _count: { select: { referrals: true } } },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/signup?ref=${user?.referralCode ?? ""}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Indique e ganhe</h1>
      <p className="text-slate-600">
        Convide outros barbeiros para o BarberOS. A cada indicação que assinar um plano, você ganha desconto na sua mensalidade.
      </p>

      <div className="rounded-xl border border-slate-200 p-6">
        <div className="text-sm text-slate-500">Seu link de indicação</div>
        <div className="mt-2 break-all rounded-lg bg-slate-50 p-3 font-mono text-sm">{link}</div>
        <div className="mt-3"><CopyLink link={link} /></div>
        <div className="mt-6 text-sm">
          Indicações confirmadas: <span className="font-semibold">{user?._count.referrals ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
