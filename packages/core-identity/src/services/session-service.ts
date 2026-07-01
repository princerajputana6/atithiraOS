import { getUserRepository, getSessionDenylistRepository } from "../collections";

/** Invalidates every existing session for this user (e.g. after password change). */
export async function logoutEverywhere(userId: string): Promise<void> {
  const userRepo = await getUserRepository();
  await userRepo.bumpSessionVersion(userId);
}

/** Invalidates one specific session/device without affecting the user's others. */
export async function revokeSession(jti: string, expiresAt: Date): Promise<void> {
  const denylistRepo = await getSessionDenylistRepository();
  await denylistRepo.denylist(jti, expiresAt);
}
