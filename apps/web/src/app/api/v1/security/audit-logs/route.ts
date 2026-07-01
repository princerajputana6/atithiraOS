import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS, getAuditLogRepository } from "@atithira/core-security";
import { ensureBootstrapped } from "@/lib/bootstrap";

const protectedGet = requirePermission(PERMISSIONS.SECURITY_AUDIT_READ)(async () => {
  const auditRepo = await getAuditLogRepository();
  const logs = await auditRepo.list(100);
  return NextResponse.json({ logs });
});

export async function GET(req: Request) {
  await ensureBootstrapped();
  return protectedGet(req, undefined);
}
