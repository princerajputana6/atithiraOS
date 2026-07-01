import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type { ApiKey } from "@atithira/types";

export class ApiKeyRepository extends TenantScopedRepository<ApiKey> {
  protected readonly targetType = "api_key";
  constructor(collection: Collection<ApiKey>) {
    super(collection);
  }
  listActive() {
    return this.find({ revokedAt: null } as Filter<ApiKey>);
  }
  revoke(id: string) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { revokedAt: new Date() } },
      { action: "api_key.revoked" },
    );
  }

  /**
   * Deliberate exception to tenant scoping: an inbound API-key request has no
   * tenant context yet — verifying the key is what establishes it. Looks up by
   * hash across all tenants, then the caller adopts the key's tenantId.
   */
  async findByHashUnscoped(keyHash: string): Promise<ApiKey | null> {
    return this.collection.findOne({
      keyHash,
      revokedAt: null,
    } as Filter<ApiKey>);
  }

  async touchLastUsedUnscoped(id: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { lastUsedAt: new Date() } },
    );
  }
}

export async function getApiKeyRepository() {
  const db = await getDb();
  return new ApiKeyRepository(db.collection<ApiKey>("api_keys"));
}
