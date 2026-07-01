import { ObjectId, type Collection } from "mongodb";
import type { SsoTicket } from "@atithira/types";

const TICKET_TTL_MS = 60_000; // one minute — just long enough for a browser redirect

/**
 * Deliberately NOT a TenantScopedRepository: a ticket is consumed before any
 * session (and therefore tenant context) exists — it's what establishes one.
 */
export class SsoTicketRepository {
  constructor(private readonly collection: Collection<SsoTicket>) {}

  async issue(userId: string, tenantId: string): Promise<string> {
    const result = await this.collection.insertOne({
      userId,
      tenantId,
      expiresAt: new Date(Date.now() + TICKET_TTL_MS),
      usedAt: null,
      createdAt: new Date(),
    } as SsoTicket);
    return String(result.insertedId);
  }

  /**
   * Atomically marks the ticket used and returns it in the same operation —
   * two concurrent consume attempts on a captured/replayed ticket must not
   * both succeed, so this can't be a separate find-then-update.
   */
  async consume(ticketId: string): Promise<SsoTicket | null> {
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(ticketId);
    } catch {
      return null;
    }
    const result = await this.collection.findOneAndUpdate(
      {
        _id: objectId,
        usedAt: null,
        expiresAt: { $gt: new Date() },
      } as never,
      { $set: { usedAt: new Date() } },
      { returnDocument: "after" },
    );
    return result ? { ...result, _id: String(result._id) } : null;
  }
}
