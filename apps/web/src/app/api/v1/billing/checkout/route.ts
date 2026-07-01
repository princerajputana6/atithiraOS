import { PERMISSIONS } from "@atithira/core-security";
import { createCheckoutOrder, isRazorpayConfigured } from "@atithira/core-billing";
import type { PlanKey } from "@atithira/types";
import { tenantApi } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return tenantApi(PERMISSIONS.BILLING_SUBSCRIPTION_MANAGE, async () => {
    if (!isRazorpayConfigured()) {
      throw new Error("Payment gateway is not configured for this deployment");
    }
    const planKey = body.planKey as PlanKey | undefined;
    if (!planKey) throw new Error("planKey is required");
    return createCheckoutOrder(planKey);
  });
}
