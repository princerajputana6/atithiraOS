import { ObjectId, type Collection, type Filter } from "mongodb";
import type { PasswordResetToken } from "@atithira/types";

export class PasswordResetTokenRepository {
  constructor(private readonly collection: Collection<PasswordResetToken>) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.collection.insertOne({
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
    } as PasswordResetToken);
  }

  async findValidByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const doc = await this.collection.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    } as Filter<PasswordResetToken>);
    return doc as unknown as PasswordResetToken | null;
  }

  async markUsed(tokenId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(tokenId) } as unknown as Filter<PasswordResetToken>,
      { $set: { usedAt: new Date() } },
    );
  }
}
