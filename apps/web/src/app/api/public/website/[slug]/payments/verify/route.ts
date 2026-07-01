import { NextResponse } from "next/server";
import { getOrganizationRepository, getTenantRazorpayCredentials } from "@atithira/core-tenancy";
import { verifyCheckoutSignature } from "@atithira/core-billing";
import { markBookingPaid, markWebsiteOrderPaid } from "@atithira/module-website";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";

/**
 * Confirms a tenant-website payment. The browser posts the Razorpay Checkout
 * handshake (order id, payment id, signature) after a successful charge; we
 * re-verify the HMAC with the tenant's own key secret before marking the
 * booking/order paid — the client callback is never trusted on its own.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureBootstrapped();
  const { slug } = await params;

  const org = await (await getOrganizationRepository()).findBySlug(slug);
  if (!org) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as {
    kind?: "booking" | "order";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    signature?: string;
  };
  const { kind, razorpayOrderId, razorpayPaymentId, signature } = body;
  if (
    (kind !== "booking" && kind !== "order") ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !signature
  ) {
    return NextResponse.json({ error: "Invalid verification payload" }, { status: 400 });
  }

  try {
    const ok = await runWithTenantContext(
      { tenantId: org._id, userId: null },
      async () => {
        const creds = await getTenantRazorpayCredentials();
        if (!creds) throw new Error("Payment gateway not connected");

        const valid = verifyCheckoutSignature({
          keySecret: creds.keySecret,
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature,
        });
        if (!valid) return false;

        if (kind === "booking") {
          await markBookingPaid(razorpayOrderId, razorpayPaymentId);
        } else {
          await markWebsiteOrderPaid(razorpayOrderId, razorpayPaymentId);
        }
        return true;
      },
    );
    if (!ok) return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
