import { NextResponse } from "next/server";
import { resolveActor, getRolesForUser } from "@atithira/core-security";
import { runWithTenantContext } from "@atithira/db";
import { getMembershipRepository } from "@atithira/core-tenancy";
import { getUserRepository } from "@atithira/core-identity";
import { ensureBootstrapped } from "@/lib/bootstrap";

export async function GET() {
  await ensureBootstrapped();
  const actor = await resolveActor();
  if (!actor?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runWithTenantContext(
    { tenantId: actor.tenantId, userId: actor.userId },
    async () => {
      const membershipRepo = await getMembershipRepository();
      const memberships = await membershipRepo.listMembers();
      const userRepo = await getUserRepository();

      const members = await Promise.all(
        memberships.map(async (membership) => {
          const user = await userRepo.findById(membership.userId);
          const roles = await getRolesForUser(membership.userId);
          return {
            userId: membership.userId,
            email: user?.email,
            name: user?.name,
            status: membership.status,
            roles: roles.map((role) => role.name),
          };
        }),
      );

      return NextResponse.json({ members });
    },
  );
}
