import { NextResponse } from "next/server";
import { requestPasswordReset } from "@atithira/core-identity";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function POST(req: Request) {
  await ensureBootstrapped();
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  await requestPasswordReset(email);
  // Always OK — never reveal whether the account exists.
  return NextResponse.json({ ok: true });
}
