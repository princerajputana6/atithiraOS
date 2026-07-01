import { ObjectId, type Collection } from "mongodb";
import type { Organization, TenantLifecycleState } from "@atithira/types";

/**
 * The tenant root. Deliberately NOT a TenantScopedRepository: an
 * organization's own `_id` *is* the tenantId, so there is no parent scope to
 * inject. This is the one collection core-tenancy is allowed to query
 * directly with the raw Mongo driver (see eslint.config.mjs).
 */
export class OrganizationRepository {
  constructor(private readonly collection: Collection<Organization>) {}

  async create(
    org: Omit<Organization, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Organization> {
    const now = new Date();
    const doc = { ...org, createdAt: now, updatedAt: now } as Organization;
    const result = await this.collection.insertOne(doc);
    return { ...doc, _id: String(result.insertedId) };
  }

  async findById(tenantId: string): Promise<Organization | null> {
    return this.collection.findOne({ _id: new ObjectId(tenantId) } as never);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.collection.findOne({ slug } as never);
  }

  async updateStatus(
    tenantId: string,
    status: TenantLifecycleState,
  ): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(tenantId) } as never,
      { $set: { status, updatedAt: new Date() } },
    );
  }
}
