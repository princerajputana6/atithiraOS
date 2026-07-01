import { TenantScopedRepository } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type { Invite } from "@atithira/types";

export class InviteRepository extends TenantScopedRepository<Invite> {
  protected readonly targetType = "invite";

  constructor(collection: Collection<Invite>) {
    super(collection);
  }

  /**
   * Deliberate exception to tenant scoping: an invite-acceptance link is
   * opened by an anonymous visitor who has no tenant context yet — there is
   * no tenant to scope by until the invite itself is looked up. Bypasses
   * requireTenantId() on purpose.
   */
  async findByTokenHashUnscoped(tokenHash: string): Promise<Invite | null> {
    const doc = await this.collection.findOne({
      tokenHash,
      status: "pending",
      expiresAt: { $gt: new Date() },
    } as Filter<Invite>);
    return doc as unknown as Invite | null;
  }

  /** Call once inside runWithTenantContext({ tenantId: invite.tenantId, ... }) — normal tenant-scoped write. */
  async markAccepted(inviteId: string): Promise<void> {
    await this.updateOne(
      { _id: new ObjectId(inviteId) } as unknown as Filter<Invite>,
      { $set: { status: "accepted" } },
      { action: "invite.accepted" },
    );
  }
}
