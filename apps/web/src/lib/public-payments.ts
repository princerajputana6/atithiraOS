import { getTenantRazorpayCredentials } from "@atithira/core-tenancy";
import { createRazorpayOrderWithKeys, type TenantRazorpayOrder } from "@atithira/core-billing";

export interface PublicPaymentIntent {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

/**
 * Starts an online payment on the *tenant's own* Razorpay account for a
 * website booking/order total. Returns null when the amount is 0 (free) or the
 * tenant hasn't connected/enabled a gateway — in which case the caller records
 * the transaction as pay-offline. Call inside the tenant's runWithTenantContext.
 */
export async function startTenantPayment(args: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<PublicPaymentIntent | null> {
  if (args.amountPaise <= 0) return null;
  const creds = await getTenantRazorpayCredentials();
  if (!creds) return null;

  const order: TenantRazorpayOrder = await createRazorpayOrderWithKeys({
    keyId: creds.keyId,
    keySecret: creds.keySecret,
    amountPaise: args.amountPaise,
    receipt: args.receipt,
    notes: args.notes,
  });
  return {
    orderId: order.orderId,
    amountPaise: order.amountPaise,
    currency: order.currency,
    keyId: order.keyId,
  };
}
