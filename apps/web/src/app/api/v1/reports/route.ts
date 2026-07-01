import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@atithira/core-security";
import { listReports } from "@atithira/core-reporting";
import { ensureBootstrapped } from "@/lib/bootstrap";

const protectedGet = requirePermission(PERMISSIONS.REPORTING_READ)(async () => {
  return NextResponse.json({ reports: listReports() });
});

export async function GET(req: Request) {
  await ensureBootstrapped();
  return protectedGet(req, undefined);
}
