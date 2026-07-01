import { TenantScopedRepository } from "@atithira/db";
import type { Collection, Filter, UpdateFilter } from "mongodb";
import type { TenantConfig } from "@atithira/types";

export class TenantConfigRepository extends TenantScopedRepository<TenantConfig> {
  protected readonly targetType = "tenant_config";

  constructor(collection: Collection<TenantConfig>) {
    super(collection);
  }

  async getForTenant(): Promise<TenantConfig | null> {
    return this.findOne({} as Filter<TenantConfig>);
  }

  async updateForTenant(update: UpdateFilter<TenantConfig>): Promise<void> {
    await this.updateOne({} as Filter<TenantConfig>, update, {
      action: "tenant_config.update",
    });
  }
}
