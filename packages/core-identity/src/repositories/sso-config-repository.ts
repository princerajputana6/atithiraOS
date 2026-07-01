import { ObjectId, type Collection, type Filter } from "mongodb";
import type { SsoConfig } from "@atithira/types";

/**
 * Deliberately NOT a TenantScopedRepository: login-time resolution ("which
 * tenant does this email belong to?") happens before any tenant context
 * exists — the same exception OrganizationRepository documents.
 */
export class SsoConfigRepository {
  constructor(private readonly collection: Collection<SsoConfig>) {}

  async findByTenantId(tenantId: string): Promise<SsoConfig | null> {
    return this.collection.findOne({ tenantId } as Filter<SsoConfig>);
  }

  /** Cross-tenant read — resolves an SSO login attempt to its owning tenant by the caller's email domain. */
  async findEnabledByEmailDomain(domain: string): Promise<SsoConfig | null> {
    return this.collection.findOne({
      enabled: true,
      emailDomains: domain.toLowerCase(),
    } as Filter<SsoConfig>);
  }

  async upsertForTenant(
    tenantId: string,
    config: Omit<SsoConfig, "_id" | "tenantId" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    await this.collection.updateOne(
      { tenantId } as Filter<SsoConfig>,
      {
        $set: { ...config, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  async findById(id: string): Promise<SsoConfig | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) } as never);
    return doc ? { ...doc, _id: String(doc._id) } : null;
  }
}
