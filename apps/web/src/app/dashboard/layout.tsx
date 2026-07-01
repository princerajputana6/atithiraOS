import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import { getUserRepository } from "@atithira/core-identity";
import {
  getActiveTenantIdForUser,
  getOrganizationRepository,
  getModuleAccess,
} from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) {
    const userRepo = await getUserRepository();
    if (await userRepo.isPlatformOwner(session.user.id)) redirect("/admin");
    redirect("/login");
  }

  const { org, enabledModules } = await runWithTenantContext(
    { tenantId, userId: session.user.id },
    async () => {
      const orgRepo = await getOrganizationRepository();
      const org = await orgRepo.findById(tenantId);
      const enabledModules = await getModuleAccess();
      return { org, enabledModules };
    },
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar enabledModules={enabledModules} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          orgName={org?.name ?? "Workspace"}
          userEmail={session.user.email ?? ""}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
