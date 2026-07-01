import { NextResponse } from "next/server";
import { resetPassword } from "@atithira/core-identity";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function POST(req: Request) {
  await ensureBootstrapped();
  const { token, password } = (await req.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
  };
  if (!token || !password) {
    return NextResponse.json(
      { error: "token and password are required" },
      { status: 400 },
    );
  }

  try {
    await resetPassword(token, password);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reset failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
