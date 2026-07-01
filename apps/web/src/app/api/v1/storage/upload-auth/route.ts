import { NextResponse } from "next/server";
import { resolveActor } from "@atithira/core-security";
import { getUploadAuthParams } from "@atithira/core-storage";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function GET() {
  await ensureBootstrapped();
  const actor = await resolveActor();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getUploadAuthParams());
}
