import { NextResponse } from "next/server";
import { verifyEmail } from "@atithira/core-identity";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function POST(req: Request) {
  await ensureBootstrapped();
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  try {
    await verifyEmail(token);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
