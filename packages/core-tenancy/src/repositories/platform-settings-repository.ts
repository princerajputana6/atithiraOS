import type { Collection } from "mongodb";
import type { ModuleKey } from "@atithira/types";

export interface PlatformSettingsDoc {
  _id: "module-defaults";
  overrides: Partial<Record<ModuleKey, boolean>>;
  updatedAt: Date;
}

/**
 * A single, platform-wide (not tenant-scoped) settings singleton. Like
 * OrganizationRepository, this is deliberately NOT a TenantScopedRepository —
 * there is no tenant to scope by, since this configures the default catalog
 * every new tenant is provisioned against.
 */
export class PlatformSettingsRepository {
  constructor(private readonly collection: Collection<PlatformSettingsDoc>) {}

  async getModuleOverrides(): Promise<Partial<Record<ModuleKey, boolean>>> {
    const doc = await this.collection.findOne({ _id: "module-defaults" } as never);
    return doc?.overrides ?? {};
  }

  async setModuleDefault(moduleKey: ModuleKey, enabled: boolean): Promise<void> {
    await this.collection.updateOne(
      { _id: "module-defaults" } as never,
      { $set: { [`overrides.${moduleKey}`]: enabled, updatedAt: new Date() } },
      { upsert: true },
    );
  }
}
