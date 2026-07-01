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

  /** Daily activity counts for the trailing `days` — the raw series behind the Analytics Service's activity trend chart. */
  async countByDay(days: number): Promise<{ date: string; count: number }[]> {
    const tenantId = this.requireTenantId();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await this.collection
      .aggregate<{ _id: string; count: number }>([
        { $match: { tenantId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();
    return rows.map((r) => ({ date: r._id, count: r.count }));
  }

  /** Most frequent actions in the trailing `days` — e.g. "invoice.paid": 42. */
  async countByAction(
    days: number,
    limit = 10,
  ): Promise<{ action: string; count: number }[]> {
    const tenantId = this.requireTenantId();
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await this.collection
      .aggregate<{ _id: string; count: number }>([
        { $match: { tenantId, createdAt: { $gte: since } } },
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();
    return rows.map((r) => ({ action: r._id, count: r.count }));
  }
}
