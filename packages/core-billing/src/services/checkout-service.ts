import { getTenantContext } from "@atithira/db";
import { getEnv } from "@atithira/config";
import type { PlanKey } from "@atithira/types";
import { getPlanRepository, getBillingPaymentRepository } from "../collections";
import { getRazorpayClient, isRazorpayConfigured } from "../razorpay-client";

export interface CheckoutOrder {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  planKey: PlanKey;
}

/**
 * Creates a Razorpay order for the given plan and records it as a "created"
 * payment. Call inside runWithTenantContext for the paying tenant. Actual
 * subscription activation happens later, when Razorpay calls the webhook
 * with a captured payment — never trust the client-side checkout callback
 * alone for that (see webhook-service.ts).
 */
export async function createCheckoutOrder(planKey: PlanKey): Promise<CheckoutOrder> {
  if (!isRazorpayConfigured()) {
    throw new Error("Payment gateway is not configured for this deployment");
  }
  const ctx = getTenantContext();
  if (!ctx?.tenantId) {
    throw new Error("No tenant context is set");
  }

  const planRepo = await getPlanRepository();
  const plan = await planRepo.findByKey(planKey);
  if (!plan) throw new Error(`Unknown plan: ${planKey}`);
  if (plan.priceMonthly <= 0) {
    throw new Error(`${plan.name} has no charge — nothing to check out`);
  }

  const amountPaise = Math.round(plan.priceMonthly * 100);
  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `sub_${ctx.tenantId}_${Date.now()}`,
    notes: { tenantId: ctx.tenantId, planKey },
  });

  const paymentRepo = await getBillingPaymentRepository();
  await paymentRepo.insertOne(
    {
      planKey,
      amountPaise,
      currency: "INR",
      status: "created",
      razorpayOrderId: order.id,
      createdAt: new Date(),
    },
    { action: "billing_payment.created" },
  );

  return {
    orderId: order.id,
    amountPaise,
    currency: "INR",
    // Non-null: isRazorpayConfigured() above already guarantees this is set.
    keyId: getEnv().RAZORPAY_KEY_ID as string,
    planKey,
  };
}
