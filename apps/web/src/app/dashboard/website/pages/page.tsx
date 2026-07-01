import { redirect } from "next/navigation";
import { auth } from "@atithira/core-identity/auth";
import { getActiveTenantIdForUser, getTenantConfigRepository } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import { PagesClient } from "@/components/website/pages-client";
import { requireModule } from "@/lib/require-module";

export default async function WebsitePagesPage() {
  await requireModule("website");
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const tenantId = await getActiveTenantIdForUser(session.user.id);
  if (!tenantId) redirect("/login");

  // The tenant's industry pack decides which templates to surface first.
  const industry = await runWithTenantContext(
    { tenantId, userId: session.user.id },
    async () => (await (await getTenantConfigRepository()).getForTenant())?.industryPack ?? null,
  );

  return <PagesClient industry={industry} />;
}
