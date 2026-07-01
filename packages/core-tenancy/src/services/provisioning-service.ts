import { runWithTenantContext } from "@atithira/db";
import { seedDefaultRolesForTenant, assignRole } from "@atithira/core-security";
import { publishEvent } from "@atithira/core-events";
import { attachPlan } from "@atithira/core-billing";
import type { Branch, TenantConfig, Membership, Organization } from "@atithira/types";
import {
  getOrganizationRepository,
  getBranchRepository,
  getTenantConfigRepository,
  getMembershipRepository,
} from "../collections";
import { getDefaultFeatureFlagsForNewTenant } from "./platform-module-service";

export interface CreateOrganizationInput {
  organizationName: string;
  slug: string;
  ownerUserId: string;
  ownerEmail: string;
  locale?: string;
  currency?: string;
  timezone?: string;
}

const TRIAL_DAYS = 14;

/**
 * The Phase 1 vertical slice's core step: creates the tenant root, then
 * synchronously seeds everything a brand-new tenant needs (HQ branch,
 * default config, default roles, owner membership + role binding) inside a
 * single tenant context, before firing the tenant/created event for
 * side-effects only (e.g. welcome email).
 */
export async function createOrganizationForNewUser(
  input: CreateOrganizationInput,
): Promise<Organization> {
  const orgRepo = await getOrganizationRepository();

  const existing = await orgRepo.findBySlug(input.slug);
  if (existing) {
    throw new Error(`Organization slug "${input.slug}" is already taken`);
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const org = await orgRepo.create({
    name: input.organizationName,
    slug: input.slug,
    status: "trial",
    trialEndsAt,
    ownerUserId: input.ownerUserId,
  });

  const tenantId = org._id;

  await runWithTenantContext(
    { tenantId, userId: input.ownerUserId },
    async () => {
      const branchRepo = await getBranchRepository();
      const configRepo = await getTenantConfigRepository();
      const membershipRepo = await getMembershipRepository();
      const featureFlags = await getDefaultFeatureFlagsForNewTenant();

      await branchRepo.insertOne(
        {
          name: "Head Office",
          code: "HQ",
          isHQ: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Omit<Branch, "_id" | "tenantId">,
        { skipAudit: true },
      );

      await configRepo.insertOne(
        {
          branding: {},
          locale: input.locale ?? "en-IN",
          currency: input.currency ?? "INR",
          timezone: input.timezone ?? "Asia/Kolkata",
          featureFlags,
        } as Omit<TenantConfig, "_id" | "tenantId">,
        { skipAudit: true },
      );

      const roleIdsByKey = await seedDefaultRolesForTenant(tenantId);

      await membershipRepo.insertOne(
        {
          userId: input.ownerUserId,
          status: "active",
          joinedAt: new Date(),
          createdAt: new Date(),
        } as Omit<Membership, "_id" | "tenantId">,
        { skipAudit: true },
      );

      const ownerRoleId = roleIdsByKey.org_owner;
      if (!ownerRoleId) {
        throw new Error("org_owner role was not seeded for new tenant");
      }
      await assignRole(input.ownerUserId, ownerRoleId, { level: "org" });

      await attachPlan("free");

      await publishEvent("tenant/created", {
        tenantId,
        ownerUserId: input.ownerUserId,
        ownerEmail: input.ownerEmail,
        organizationName: input.organizationName,
      });
    },
  );

  return org;
}
