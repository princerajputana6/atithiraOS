import { auth } from "@atithira/core-identity/auth";
import { getUserRepository } from "@atithira/core-identity";

export interface PlatformOwnerActor {
  userId: string;
  email: string;
}

/**
 * Resolves the current session and confirms it belongs to a Platform Owner
 * (global Atithira staff). Returns null otherwise. Every /admin route and
 * /api/v1/admin endpoint gates on this — it is the only authorization check
 * for the cross-tenant admin surface, so it is deliberately a fresh DB
 * lookup (not a trusting-the-JWT-claim shortcut).
 */
export async function resolvePlatformOwner(): Promise<PlatformOwnerActor | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userRepo = await getUserRepository();
  const isOwner = await userRepo.isPlatformOwner(session.user.id);
  if (!isOwner) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
  };
}
