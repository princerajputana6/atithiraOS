import { ObjectId, type Collection, type Filter } from "mongodb";
import type { EmailVerificationToken } from "@atithira/types";

export class EmailVerificationTokenRepository {
  constructor(private readonly collection: Collection<EmailVerificationToken>) {}

  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.collection.insertOne({
      userId,
      tokenHash,
      expiresAt,
      usedAt: null,
    } as EmailVerificationToken);
  }

  async findValidByHash(
    tokenHash: string,
  ): Promise<EmailVerificationToken | null> {
    const doc = await this.collection.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    } as Filter<EmailVerificationToken>);
    return doc as unknown as EmailVerificationToken | null;
  }

  async markUsed(tokenId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(tokenId) } as unknown as Filter<EmailVerificationToken>,
      { $set: { usedAt: new Date() } },
    );
  }
}
