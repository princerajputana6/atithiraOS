import { NextResponse } from "next/server";
import { resolveActor } from "@atithira/core-security";
import { runWithTenantContext } from "@atithira/db";
import { getOrganizationRepository, getTenantConfigRepository } from "@atithira/core-tenancy";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function GET() {
  await ensureBootstrapped();
  const actor = await resolveActor();
  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runWithTenantContext(
    { tenantId: actor.tenantId, userId: actor.userId },
    async () => {
      const orgRepo = await getOrganizationRepository();
      const org = await orgRepo.findById(actor.tenantId as string);
      const configRepo = await getTenantConfigRepository();
      const config = await configRepo.getForTenant();
      return NextResponse.json({ organization: org, config });
    },
  );
}
