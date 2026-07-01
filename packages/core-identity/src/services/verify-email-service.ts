import { hashToken } from "../crypto/tokens";
import { getUserRepository, getEmailVerificationTokenRepository } from "../collections";

export async function verifyEmail(rawToken: string): Promise<void> {
  const tokenRepo = await getEmailVerificationTokenRepository();
  const record = await tokenRepo.findValidByHash(hashToken(rawToken));
  if (!record) {
    throw new Error("Invalid or expired verification token");
  }

  const userRepo = await getUserRepository();
  await userRepo.markEmailVerified(record.userId);
  await tokenRepo.markUsed(String(record._id));
}
