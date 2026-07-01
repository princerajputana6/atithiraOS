import { TenantScopedRepository } from "@atithira/db";
import type { Collection, Filter } from "mongodb";
import type { AuditLogEntry } from "@atithira/types";

/**
 * Append-only. Only `append()` and `list()` are ever called against this
 * collection — updateOne/deleteOne are inherited from the base class but must
 * never be used here; immutability of the audit trail is an application-level
 * convention, not something Atlas M0's free tier can enforce for us.
 */
export class AuditLogRepository extends TenantScopedRepository<AuditLogEntry> {
  protected readonly targetType = "audit_log";

  constructor(collection: Collection<AuditLogEntry>) {
    super(collection);
  }

  async append(
    entry: Omit<AuditLogEntry, "_id" | "tenantId">,
  ): Promise<AuditLogEntry> {
    // skipAudit: true — inserting an audit entry must never itself trigger
    // another audit-hook call, which would recurse forever.
    return this.insertOne(entry as AuditLogEntry, { skipAudit: true });
  }

  async list(limit = 100): Promise<AuditLogEntry[]> {
    const tenantId = this.requireTenantId();
    return this.collection
      .find({ tenantId } as Filter<AuditLogEntry>)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
}
