import { getMembershipRepository } from "../collections";

export async function getActiveTenantIdForUser(
  userId: string,
): Promise<string | null> {
  const repo = await getMembershipRepository();
  return repo.findActiveTenantIdForUserUnscoped(userId);
}
