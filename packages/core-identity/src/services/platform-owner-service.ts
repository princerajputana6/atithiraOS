import type { UserRecord } from "@atithira/types";
import { hashPassword } from "../crypto/password";
import { getUserRepository } from "../collections";

export interface SeedPlatformOwnerInput {
  email: string;
  password: string;
  name?: string;
}

/**
 * Creates (or promotes) the global Platform Owner — Atithira staff who manage
 * every tenant from the admin console. Idempotent: if the email already
 * exists it is promoted to platform owner and its password reset, rather than
 * erroring. Not exposed via any HTTP route; only reachable through the seed
 * script (pnpm seed:admin).
 */
export async function seedPlatformOwner(
  input: SeedPlatformOwnerInput,
): Promise<{ userId: string; created: boolean }> {
  const userRepo = await getUserRepository();
  const passwordHash = await hashPassword(input.password);

  const existing = await userRepo.findByEmail(input.email);
  if (existing) {
    await userRepo.promoteToPlatformOwner(existing._id, passwordHash);
    return { userId: existing._id, created: false };
  }

  const user = await userRepo.create({
    email: input.email.toLowerCase(),
    emailVerified: new Date(),
    name: input.name ?? "Platform Owner",
    passwordHash,
    mfaEnabled: false,
    mfaSecret: null,
    mfaRecoveryCodesHash: [],
    sessionVersion: 0,
    status: "active",
    isPlatformOwner: true,
  } as Omit<UserRecord, "_id" | "createdAt" | "updatedAt">);

  return { userId: user._id, created: true };
}
