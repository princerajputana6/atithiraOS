import type { Plan, PlanKey, Subscription } from "@atithira/types";
import { getPlanRepository, getSubscriptionRepository } from "../collections";

const DEFAULT_PLANS: Omit<Plan, "_id">[] = [
  { key: "free", name: "Free", priceMonthly: 0, limits: { users: 3 }, features: [] },
  { key: "starter", name: "Starter", priceMonthly: 999, limits: { users: 10 }, features: [] },
  { key: "growth", name: "Growth", priceMonthly: 2999, limits: { users: 50 }, features: [] },
  {
    key: "enterprise",
    name: "Enterprise",
    priceMonthly: 0,
    limits: { users: Number.POSITIVE_INFINITY },
    features: [],
  },
];

/** Idempotent — safe to call at every app boot. */
export async function seedDefaultPlans(): Promise<void> {
  const planRepo = await getPlanRepository();
  for (const plan of DEFAULT_PLANS) {
    await planRepo.upsert(plan);
  }
}

/**
 * Skeleton only — no payment gateway integration. Attaches a plan to a
 * tenant's subscription record so every tenant has one from day one and
 * later phases can plug in Razorpay/Stripe without a schema change. Call
 * inside runWithTenantContext for the target tenant.
 */
export async function attachPlan(
  planKey: PlanKey = "free",
): Promise<Subscription> {
  const subscriptionRepo = await getSubscriptionRepository();
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return subscriptionRepo.insertOne(
    {
      planKey,
      status: "trialing",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    } as Omit<Subscription, "_id" | "tenantId">,
    { action: "subscription.attached" },
  );
}

export async function getActivePlan(): Promise<Plan | null> {
  const subscriptionRepo = await getSubscriptionRepository();
  const subscription = await subscriptionRepo.getForTenant();
  if (!subscription) return null;

  const planRepo = await getPlanRepository();
  return planRepo.findByKey(subscription.planKey);
}
