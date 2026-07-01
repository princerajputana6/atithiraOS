import { NextResponse } from "next/server";
import { getUserRepository } from "@atithira/core-identity";
import { getOrganizationRepository } from "@atithira/core-tenancy";
import { getPlanRepository, getSubscriptionRepository } from "@atithira/core-billing";
import { runWithTenantContext } from "@atithira/db";
import type { PlanKey, TenantLifecycleState } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";

const EMPTY_TENANT_COUNTS: Record<TenantLifecycleState, number> = {
  trial: 0,
  active: 0,
  suspended: 0,
  churned: 0,
};

export async function GET() {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgRepo = await getOrganizationRepository();
  const userRepo = await getUserRepository();
  const planRepo = await getPlanRepository();

  const [orgs, userCount, plans] = await Promise.all([
    orgRepo.listAll(),
    userRepo.count(),
    planRepo.list(),
  ]);

  const priceByPlan = new Map<PlanKey, number>(
    plans.map((p) => [p.key, p.priceMonthly]),
  );

  const tenantsByStatus = { ...EMPTY_TENANT_COUNTS };
  for (const org of orgs) tenantsByStatus[org.status] += 1;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newTenants7d = orgs.filter((o) => o.createdAt >= sevenDaysAgo).length;

  const planDistribution: Record<string, number> = {};
  let mrr = 0;

  await Promise.all(
    orgs.map((org) =>
      runWithTenantContext({ tenantId: org._id, userId: null }, async () => {
        const subscriptionRepo = await getSubscriptionRepository();
        const subscription = await subscriptionRepo.getForTenant();
        if (!subscription) return;
        planDistribution[subscription.planKey] =
          (planDistribution[subscription.planKey] ?? 0) + 1;
        if (subscription.status === "active") {
          mrr += priceByPlan.get(subscription.planKey) ?? 0;
        }
      }),
    ),
  );

  return NextResponse.json({
    tenants: orgs.length,
    activeTenants: tenantsByStatus.active + tenantsByStatus.trial,
    tenantsByStatus,
    newTenants7d,
    users: userCount,
    mrr,
    planDistribution,
  });
}
