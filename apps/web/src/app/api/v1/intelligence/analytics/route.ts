import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@atithira/core-security";
import { getActivitySummary } from "@atithira/core-analytics";
import { ensureBootstrapped } from "@/lib/bootstrap";

const protectedGet = requirePermission(PERMISSIONS.SECURITY_AUDIT_READ)(async () => {
  const summary = await getActivitySummary(30);
  return NextResponse.json(summary);
});

export async function GET(req: Request) {
  await ensureBootstrapped();
  return protectedGet(req, undefined);
}
