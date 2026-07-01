import { TenantScopedRepository } from "@atithira/db";
import type { Collection, Filter } from "mongodb";
import type { Subscription } from "@atithira/types";

export class SubscriptionRepository extends TenantScopedRepository<Subscription> {
  protected readonly targetType = "subscription";

  constructor(collection: Collection<Subscription>) {
    super(collection);
  }

  async getForTenant(): Promise<Subscription | null> {
    return this.findOne({} as Filter<Subscription>);
  }
}
