import { createHmac, timingSafeEqual } from "node:crypto";
import { runWithTenantContext } from "@atithira/db";
import { getEnv } from "@atithira/config";
import type { PlanKey } from "@atithira/types";
import { getSubscriptionRepository, getBillingPaymentRepository } from "../collections";

/**
 * Verifies the `X-Razorpay-Signature` header against the *raw* request body.
 * Must run on the untouched bytes Razorpay signed — parsing to JSON and
 * re-serializing first would invalidate the signature on almost any payload.
 */
export function verifyRazorpaySignature(rawBody: string, signature: string | null): boolean {
  const secret = getEnv().RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}

interface RazorpayOrderNotes {
  tenantId?: string;
  planKey?: string;
}

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        notes?: RazorpayOrderNotes;
      };
    };
  };
}

/**
 * Handles a verified Razorpay webhook event. Only `payment.captured` moves
 * money into an activated subscription — `order.paid` and other events are
 * acknowledged but ignored, since captured payment is the one durable signal
 * that funds actually settled (the client-side checkout success callback is
 * not trustworthy on its own: it fires before capture and can be spoofed).
 */
export async function handleRazorpayWebhook(payload: RazorpayWebhookPayload): Promise<void> {
  if (payload.event !== "payment.captured") return;

  const payment = payload.payload.payment?.entity;
  if (!payment) return;

  const tenantId = payment.notes?.tenantId;
  const planKey = payment.notes?.planKey as PlanKey | undefined;
  if (!tenantId || !planKey) return;

  await runWithTenantContext({ tenantId, userId: null }, async () => {
    const paymentRepo = await getBillingPaymentRepository();
    const existing = await paymentRepo.findByRazorpayOrderId(payment.order_id);
    if (existing?.status === "captured") return; // already processed — webhooks can retry

    await paymentRepo.setStatus(payment.order_id, "captured", payment.id);

    const subscriptionRepo = await getSubscriptionRepository();
    await subscriptionRepo.activate(planKey);
  });
}
