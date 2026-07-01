import { NextResponse } from "next/server";
import { verifyRazorpaySignature, handleRazorpayWebhook } from "@atithira/core-billing";
import { ensureBootstrapped } from "@/lib/bootstrap";

/**
 * Razorpay calls this directly — no tenant session exists, so authenticity
 * rests entirely on the HMAC signature over the raw body (see
 * verifyRazorpaySignature). Never parse the body before verifying it.
 */
export async function POST(req: Request) {
  await ensureBootstrapped();

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyRazorpaySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  await handleRazorpayWebhook(payload);

  return NextResponse.json({ ok: true });
}
