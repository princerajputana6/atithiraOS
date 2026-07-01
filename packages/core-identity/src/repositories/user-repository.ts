import { ObjectId, type Collection, type Filter } from "mongodb";
import type { UserRecord } from "@atithira/types";

/**
 * Deliberately NOT a TenantScopedRepository: a user's identity is
 * tenant-agnostic (Auth.js owns it globally); tenant membership is a
 * separate join (see @atithira/core-tenancy's MembershipRepository).
 */
export class UserRepository {
  constructor(private readonly collection: Collection<UserRecord>) {}

  async create(
    user: Omit<UserRecord, "_id" | "createdAt" | "updatedAt">,
  ): Promise<UserRecord> {
    const now = new Date();
    const doc = { ...user, createdAt: now, updatedAt: now } as UserRecord;
    const result = await this.collection.insertOne(doc);
    return { ...doc, _id: String(result.insertedId) };
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const doc = await this.collection.findOne({
      email: email.toLowerCase(),
    } as Filter<UserRecord>);
    return doc as unknown as UserRecord | null;
  }

  async findById(userId: string): Promise<UserRecord | null> {
    const doc = await this.collection.findOne({
      _id: new ObjectId(userId),
    } as unknown as Filter<UserRecord>);
    return doc as unknown as UserRecord | null;
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(userId) } as unknown as Filter<UserRecord>,
      { $set: { emailVerified: new Date(), updatedAt: new Date() } },
    );
  }

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(userId) } as unknown as Filter<UserRecord>,
      {
        $set: { passwordHash, updatedAt: new Date() },
        $inc: { sessionVersion: 1 },
      },
    );
  }

  async enrollMfa(
    userId: string,
    encryptedSecret: string,
    recoveryCodesHash: string[],
  ): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(userId) } as unknown as Filter<UserRecord>,
      {
        $set: {
          mfaEnabled: true,
          mfaSecret: encryptedSecret,
          mfaRecoveryCodesHash: recoveryCodesHash,
          updatedAt: new Date(),
        },
      },
    );
  }

  /** Bumps sessionVersion, invalidating every existing JWT session ("log out everywhere"). */
  async bumpSessionVersion(userId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(userId) } as unknown as Filter<UserRecord>,
      { $inc: { sessionVersion: 1 }, $set: { updatedAt: new Date() } },
    );
  }
}
