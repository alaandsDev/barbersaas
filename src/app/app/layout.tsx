import { redirect } from "next/navigation";
import { requireUser, ensureLocalUser, getTenantContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";

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
    <div data-mode="dark" className="flex min-h-screen bg-background text-foreground md:h-screen md:overflow-hidden">
      <Sidebar
        businessName={business?.name ?? ""}
        plan={business?.subscription?.plan ?? "—"}
        status={business?.subscription?.status ?? "INACTIVE"}
      />
      <div className="flex min-w-0 flex-1 flex-col md:overflow-hidden">
        <Topbar userEmail={user.email ?? ""} userInitial={initial} />
        <main className="flex-1 p-4 md:overflow-y-auto md:p-8">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
