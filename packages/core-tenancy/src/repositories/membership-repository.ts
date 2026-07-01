import { TenantScopedRepository } from "@atithira/db";
import type { Collection, Filter } from "mongodb";
import type { Membership } from "@atithira/types";

export class MembershipRepository extends TenantScopedRepository<Membership> {
  protected readonly targetType = "membership";

  constructor(collection: Collection<Membership>) {
    super(collection);
  }

  async findForUser(userId: string): Promise<Membership | null> {
    return this.findOne({ userId } as Filter<Membership>);
  }

  async listMembers(): Promise<Membership[]> {
    return this.find({});
  }

  /**
   * Deliberate exception to tenant scoping: resolving "which tenant does this
   * user belong to" necessarily happens before any tenant context can exist
   * (it's what establishes that context for the rest of the request). Phase 1
   * assumes one active tenant per user, so the first active membership wins.
   */
  async findActiveTenantIdForUserUnscoped(userId: string): Promise<string | null> {
    const doc = await this.collection.findOne({
      userId,
      status: "active",
    } as Filter<Membership>);
    return doc?.tenantId ?? null;
  }
}
