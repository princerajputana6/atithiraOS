import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

/**
 * Per-tenant online payments. Unlike checkout-service.ts (which uses the
 * platform's single Razorpay account for subscription billing), these helpers
 * take the *tenant's own* keys as arguments so a website visitor's payment
 * settles into the tenant's account. Keys are resolved+decrypted by
 * core-tenancy's payment-service and passed in here — this file never reads
 * env or tenant config, so there is no dependency cycle.
 */

export interface TenantRazorpayOrder {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

/** Creates a Razorpay order on the tenant's account for a booking/order total. */
export async function createRazorpayOrderWithKeys(args: {
  keyId: string;
  keySecret: string;
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<TenantRazorpayOrder> {
  if (args.amountPaise <= 0) {
    throw new Error("Nothing to charge");
  }
  const client = new Razorpay({ key_id: args.keyId, key_secret: args.keySecret });
  const order = await client.orders.create({
    amount: args.amountPaise,
    currency: "INR",
    receipt: args.receipt,
    notes: args.notes,
  });
  return { orderId: order.id, amountPaise: args.amountPaise, currency: "INR", keyId: args.keyId };
}

/**
 * Verifies the Razorpay Checkout handshake signature returned to the browser
 * after a successful payment: HMAC-SHA256(keySecret, `${orderId}|${paymentId}`).
 * This is the standard client-side verification and lets us confirm a tenant
 * payment without requiring a per-tenant webhook secret.
 */
export function verifyCheckoutSignature(args: {
  keySecret: string;
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!args.orderId || !args.paymentId || !args.signature) return false;
  const expected = createHmac("sha256", args.keySecret)
    .update(`${args.orderId}|${args.paymentId}`)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(args.signature, "hex");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}
