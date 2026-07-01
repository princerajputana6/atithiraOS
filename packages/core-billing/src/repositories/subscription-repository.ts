import { TenantScopedRepository, runAuditHook } from "@atithira/db";
import type { Collection, Filter } from "mongodb";
import type { PlanKey, Subscription, SubscriptionStatus } from "@atithira/types";

export class SubscriptionRepository extends TenantScopedRepository<Subscription> {
  protected readonly targetType = "subscription";

  constructor(collection: Collection<Subscription>) {
    super(collection);
  }

  async getForTenant(): Promise<Subscription | null> {
    return this.findOne({} as Filter<Subscription>);
  }

  /**
   * Activates (or upgrades) the tenant's one subscription record after a
   * successful Razorpay payment. Each tenant has exactly one subscription
   * doc, so this is an upsert keyed on tenantId rather than a fresh insert.
   */
  async activate(planKey: PlanKey): Promise<void> {
    const tenantId = this.requireTenantId();
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    await this.collection.updateOne(
      { tenantId } as Filter<Subscription>,
      {
        $set: {
          planKey,
          status: "active" as SubscriptionStatus,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      },
      { upsert: true },
    );
    await runAuditHook({
      tenantId,
      actorUserId: null,
      action: "subscription.activated",
      targetType: "subscription",
      targetId: tenantId,
      metadata: { planKey },
    });
  }
}
