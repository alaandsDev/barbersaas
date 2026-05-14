import { redirect } from "next/navigation";
import { requireUser, ensureLocalUser, getTenantContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  await ensureLocalUser(user);
  const ctx = await getTenantContext();
  if (!ctx) redirect("/onboarding");

  const business = await prisma.business.findUnique({
    where: { id: ctx.businessId },
    include: { subscription: true },
  });

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        businessName={business?.name ?? ""}
        plan={business?.subscription?.plan ?? "—"}
        status={business?.subscription?.status ?? "INACTIVE"}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar userEmail={user.email ?? ""} userInitial={initial} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
