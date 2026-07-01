import type { Collection, Filter } from "mongodb";

export interface SessionDenylistEntry {
  _id?: string;
  jti: string;
  expiresAt: Date;
}

/**
 * Per-device/session revocation for JWT sessions (Credentials provider
 * forces the JWT strategy in Auth.js v5, so database sessions aren't an
 * option). A denylisted jti fails the jwt callback's check on next use.
 * expiresAt has a TTL index so entries self-expire once the JWT would have
 * anyway (see ensureIdentityIndexes()).
 */
export class SessionDenylistRepository {
  constructor(private readonly collection: Collection<SessionDenylistEntry>) {}

  async denylist(jti: string, expiresAt: Date): Promise<void> {
    await this.collection.insertOne({ jti, expiresAt } as SessionDenylistEntry);
  }

  async isDenylisted(jti: string): Promise<boolean> {
    const found = await this.collection.findOne({
      jti,
    } as Filter<SessionDenylistEntry>);
    return !!found;
  }
}
