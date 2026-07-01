import { describe, it, expect } from "vitest";
import { signup } from "@atithira/core-identity";
import { createOrganizationForNewUser } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import {
  getSsoConfigRepository,
  getSsoTicketRepository,
  resolveSsoConfigByEmail,
  provisionSsoUser,
} from "@atithira/core-identity";
import { getMembershipRepository } from "@atithira/core-tenancy";
import { getRolesForUser } from "@atithira/core-security";

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

describe("SSO ticket semantics (Phase 5 gate)", () => {
  it("consumes a ticket exactly once and rejects reuse", async () => {
    const { org } = await createTenant("sso-ticket");
    const ticketRepo = await getSsoTicketRepository();
    const ticketId = await ticketRepo.issue("some-user-id", org._id);

    const first = await ticketRepo.consume(ticketId);
    expect(first).not.toBeNull();
    expect(first?.userId).toBe("some-user-id");

    const second = await ticketRepo.consume(ticketId);
    expect(second).toBeNull();
  });

  it("rejects a ticket for an unknown id", async () => {
    const ticketRepo = await getSsoTicketRepository();
    expect(await ticketRepo.consume("not-a-real-object-id")).toBeNull();
  });

  it("only resolves an SSO config for an enabled tenant, by email domain", async () => {
    const { org: tenantA } = await createTenant("sso-domain-a");
    const { org: tenantB } = await createTenant("sso-domain-b");
    const domain = `acme-${Date.now()}.example`;

    const configRepo = await getSsoConfigRepository();
    await configRepo.upsertForTenant(tenantA._id, {
      protocol: "oidc",
      enabled: false, // disabled — must not resolve even though the domain matches
      emailDomains: [domain],
    });
    await configRepo.upsertForTenant(tenantB._id, {
      protocol: "oidc",
      enabled: true,
      emailDomains: [domain],
    });

    const resolved = await resolveSsoConfigByEmail(`someone@${domain}`);
    expect(resolved?.tenantId).toBe(tenantB._id);

    expect(await resolveSsoConfigByEmail("someone@no-such-domain.example")).toBeNull();
  });

  it("JIT-provisions a new SSO user with membership and the default employee role, and reuses the identity on a second login", async () => {
    const { org } = await createTenant("sso-provision");
    const email = `jit-${Date.now()}@example.com`;

    const first = await provisionSsoUser(org._id, email, "JIT User");
    expect(first.isNewUser).toBe(true);

    await runWithTenantContext({ tenantId: org._id, userId: first.userId }, async () => {
      const membershipRepo = await getMembershipRepository();
      const membership = await membershipRepo.findForUser(first.userId);
      expect(membership).not.toBeNull();
      expect(membership?.status).toBe("active");

      const roles = await getRolesForUser(first.userId);
      expect(roles.some((r) => r.key === "employee")).toBe(true);
    });

    const second = await provisionSsoUser(org._id, email, "JIT User");
    expect(second.isNewUser).toBe(false);
    expect(second.userId).toBe(first.userId);
  });
});
