import { describe, it, expect } from "vitest";
import { signup, getUserRepository } from "@atithira/core-identity";
import {
  createOrganizationForNewUser,
  getMembershipRepository,
  getOrganizationRepository,
} from "@atithira/core-tenancy";
import { getAuditLogRepository, getRolesForUser } from "@atithira/core-security";
import { runWithTenantContext } from "@atithira/db";

/**
 * The Phase 1 gate (MASTER_PLAN.md §5): "A second tenant created in parallel
 * can never see the first tenant's data." This is the single most important
 * test in the codebase — it must pass before Phase 1 is considered done.
 */
async function createTenant(label: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `${label}-owner-${suffix}@example.com`;
  const user = await signup({
    email,
    password: "Sup3rSecret!23",
    name: `${label} Owner`,
  });
  const org = await createOrganizationForNewUser({
    organizationName: `${label} Org`,
    slug: `${label}-${suffix}`,
    ownerUserId: user._id,
    ownerEmail: user.email,
  });
  return { user, org };
}

describe("cross-tenant isolation (Phase 1 gate)", () => {
  it("provisions two tenants in parallel and never leaks one into the other", async () => {
    const [tenantA, tenantB] = await Promise.all([
      createTenant("alpha"),
      createTenant("beta"),
    ]);

    // Sanity check first: both tenants' data genuinely exists. Otherwise the
    // isolation assertions below would pass vacuously.
    const orgRepo = await getOrganizationRepository();
    expect(await orgRepo.findById(tenantA.org._id)).not.toBeNull();
    expect(await orgRepo.findById(tenantB.org._id)).not.toBeNull();

    const userRepo = await getUserRepository();
    expect(await userRepo.findById(tenantA.user._id)).not.toBeNull();
    expect(await userRepo.findById(tenantB.user._id)).not.toBeNull();

    await runWithTenantContext(
      { tenantId: tenantA.org._id, userId: tenantA.user._id },
      async () => {
        // Membership: tenant A's member list must not include tenant B's owner.
        const membershipRepo = await getMembershipRepository();
        const membersOfA = await membershipRepo.listMembers();
        expect(membersOfA.some((m) => m.userId === tenantA.user._id)).toBe(true);
        expect(membersOfA.some((m) => m.userId === tenantB.user._id)).toBe(false);
        expect(await membershipRepo.findForUser(tenantB.user._id)).toBeNull();

        // Roles: resolving tenant B's user's roles from inside tenant A's
        // context must come back empty — role_bindings are tenant-scoped too.
        const rolesOfBFromA = await getRolesForUser(tenantB.user._id);
        expect(rolesOfBFromA).toEqual([]);

        // Audit log: every entry visible from tenant A's context must belong
        // to tenant A, even though tenant B has its own audit trail.
        const auditRepo = await getAuditLogRepository();
        const auditsOfA = await auditRepo.list(1000);
        expect(auditsOfA.length).toBeGreaterThan(0);
        expect(auditsOfA.every((entry) => entry.tenantId === tenantA.org._id)).toBe(
          true,
        );
      },
    );

    // And the reverse direction, for completeness.
    await runWithTenantContext(
      { tenantId: tenantB.org._id, userId: tenantB.user._id },
      async () => {
        const membershipRepo = await getMembershipRepository();
        expect(await membershipRepo.findForUser(tenantA.user._id)).toBeNull();

        const rolesOfAFromB = await getRolesForUser(tenantA.user._id);
        expect(rolesOfAFromB).toEqual([]);

        const auditRepo = await getAuditLogRepository();
        const auditsOfB = await auditRepo.list(1000);
        expect(auditsOfB.every((entry) => entry.tenantId === tenantB.org._id)).toBe(
          true,
        );
      },
    );
  });

  it("fails closed instead of silently returning unscoped data with no active tenant context", async () => {
    const membershipRepo = await getMembershipRepository();
    await expect(membershipRepo.listMembers()).rejects.toThrow();
  });
});
