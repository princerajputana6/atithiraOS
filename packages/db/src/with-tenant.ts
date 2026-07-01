import type {
  Collection,
  Document,
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
} from "mongodb";
import { getTenantContext } from "./tenant-context";
import { TenantContextMissingError } from "./errors";
import { runAuditHook } from "./audit-hook";

export interface WriteOptions {
  /** Set for high-frequency, non-sensitive writes (e.g. last-seen bumps). */
  skipAudit?: boolean;
  /** Override the default `${targetType}.${op}` audit action name. */
  action?: string;
}

/**
 * Base class every tenant-scoped repository extends. It is the single place
 * that injects `tenantId` into every query and write, and the single place
 * that fires the audit-log hook — so both guarantees hold structurally,
 * without relying on every call site remembering to apply them.
 *
 * It fails closed: calling any method without an active tenant context
 * throws rather than silently returning or writing unscoped data.
 */
export abstract class TenantScopedRepository<
  TDoc extends Document & { tenantId: string },
> {
  protected abstract readonly targetType: string;

  constructor(protected readonly collection: Collection<TDoc>) {}

  protected requireTenantId(): string {
    const ctx = getTenantContext();
    if (!ctx?.tenantId) {
      throw new TenantContextMissingError();
    }
    return ctx.tenantId;
  }

  async findOne(filter: Filter<TDoc>): Promise<TDoc | null> {
    const tenantId = this.requireTenantId();
    const doc = await this.collection.findOne(
      { ...filter, tenantId } as Filter<TDoc>,
    );
    // Our types declare `_id: string` (see with-tenant.ts's callers), while
    // the driver returns `_id: ObjectId` at runtime — every repository
    // consistently treats _id as an opaque string-ish value via String(_id).
    return doc as unknown as TDoc | null;
  }

  async find(filter: Filter<TDoc> = {} as Filter<TDoc>): Promise<TDoc[]> {
    const tenantId = this.requireTenantId();
    const docs = await this.collection
      .find({ ...filter, tenantId } as Filter<TDoc>)
      .toArray();
    return docs as unknown as TDoc[];
  }

  async insertOne(
    doc: Omit<TDoc, "_id" | "tenantId">,
    options: WriteOptions = {},
  ): Promise<TDoc> {
    const tenantId = this.requireTenantId();
    const toInsert = { ...doc, tenantId } as OptionalUnlessRequiredId<TDoc>;
    const result = await this.collection.insertOne(toInsert);
    const inserted = {
      ...doc,
      tenantId,
      _id: String(result.insertedId),
    } as unknown as TDoc;
    await this.audit(options, "insert", String(result.insertedId), inserted);
    return inserted;
  }

  async updateOne(
    filter: Filter<TDoc>,
    update: UpdateFilter<TDoc>,
    options: WriteOptions = {},
  ) {
    const tenantId = this.requireTenantId();
    const result = await this.collection.updateOne(
      { ...filter, tenantId } as Filter<TDoc>,
      update,
    );
    await this.audit(options, "update", this.extractId(filter));
    return result;
  }

  async deleteOne(filter: Filter<TDoc>, options: WriteOptions = {}) {
    const tenantId = this.requireTenantId();
    const result = await this.collection.deleteOne({
      ...filter,
      tenantId,
    } as Filter<TDoc>);
    await this.audit(options, "delete", this.extractId(filter));
    return result;
  }

  private extractId(filter: Filter<TDoc>): string {
    const id = (filter as Record<string, unknown>)._id;
    return id ? String(id) : "unknown";
  }

  private async audit(
    options: WriteOptions,
    op: "insert" | "update" | "delete",
    targetId: string,
    metadata?: unknown,
  ) {
    if (options.skipAudit) return;
    const ctx = getTenantContext();
    if (!ctx) return;
    await runAuditHook({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      action: options.action ?? `${this.targetType}.${op}`,
      targetType: this.targetType,
      targetId,
      metadata: metadata as Record<string, unknown> | undefined,
    });
  }
}
