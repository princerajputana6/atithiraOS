import { NextResponse } from "next/server";
import { getPlanRepository } from "@atithira/core-billing";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";

export async function GET() {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const planRepo = await getPlanRepository();
  const plans = await planRepo.list();
  return NextResponse.json({ plans });
}
