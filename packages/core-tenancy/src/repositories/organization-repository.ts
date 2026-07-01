import { ObjectId, type Collection } from "mongodb";
import type { Organization, TenantLifecycleState } from "@atithira/types";

/**
 * Raw Mongo docs carry an ObjectId `_id`, but the Organization type declares
 * `_id: string` and the org's `_id` is used as the string `tenantId` that
 * scopes every other collection. Stringify on read so callers never leak an
 * ObjectId into a tenant-scoped query (which would silently match nothing).
 */
function normalizeId(doc: Organization | null): Organization | null {
  if (!doc) return null;
  return { ...doc, _id: String(doc._id) };
}

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
    const doc = await this.collection.findOne({
      _id: new ObjectId(tenantId),
    } as never);
    return normalizeId(doc);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const doc = await this.collection.findOne({ slug } as never);
    return normalizeId(doc);
  }

  /**
   * Cross-tenant read, only ever called from the Platform Owner admin
   * console — listing every tenant is the whole point of that surface. Not
   * reachable from normal tenant-scoped code paths.
   */
  async listAll(): Promise<Organization[]> {
    const docs = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((doc) => normalizeId(doc) as Organization);
  }

  async count(): Promise<number> {
    return this.collection.countDocuments({});
  }

  /** Orgs owned by a given user — used to decide whether an owner is safe to delete. */
  async listByOwner(ownerUserId: string): Promise<Organization[]> {
    const docs = await this.collection.find({ ownerUserId } as never).toArray();
    return docs.map((doc) => normalizeId(doc) as Organization);
  }

  async deleteById(tenantId: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(tenantId) } as never);
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
