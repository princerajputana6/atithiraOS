import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import { getActiveTenantIdForUser, isModuleEnabled } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import type { ModuleKey } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";

/**
 * Server guard for a module's dashboard pages: redirects to /dashboard when
 * the tenant isn't entitled to `moduleKey`. Belt-and-suspenders behind the
 * sidebar hiding the nav item — a user can't reach a disabled module by typing
 * its URL.
 */
export async function requireModule(moduleKey: ModuleKey): Promise<void> {
  await ensureBootstrapped();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  const enabled = await runWithTenantContext(
    { tenantId, userId: session.user.id },
    async () => isModuleEnabled(moduleKey),
  );
  if (!enabled) redirect("/dashboard");
}
