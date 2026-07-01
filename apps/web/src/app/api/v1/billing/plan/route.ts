import { NextResponse } from "next/server";
import { resolveActor } from "@atithira/core-security";
import { runWithTenantContext } from "@atithira/db";
import { getActivePlan } from "@atithira/core-billing";
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
      const plan = await getActivePlan();
      return NextResponse.json({ plan });
    },
  );
}
