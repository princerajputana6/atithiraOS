import { NextResponse } from "next/server";
import {
  getUserRepository,
  hashPassword,
} from "@atithira/core-identity";
import {
  getOrganizationRepository,
  getMembershipRepository,
  getTenantConfigRepository,
  createOrganizationForNewUser,
  applySolutionPack,
} from "@atithira/core-tenancy";
import { getSolutionPack, MODULE_CATALOG, type ModuleKey } from "@atithira/types";
import { getActivePlan } from "@atithira/core-billing";
import { runWithTenantContext } from "@atithira/db";
import type { UserRecord } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";

export async function GET() {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgRepo = await getOrganizationRepository();
  const userRepo = await getUserRepository();
  const orgs = await orgRepo.listAll();

  const tenants = await Promise.all(
    orgs.map(async (org) => {
      const ownerUser = await userRepo.findById(org.ownerUserId);
      const { memberCount, planKey, industryPack } = await runWithTenantContext(
        { tenantId: org._id, userId: null },
        async () => {
          const membershipRepo = await getMembershipRepository();
          const members = await membershipRepo.listMembers();
          const plan = await getActivePlan();
          const configRepo = await getTenantConfigRepository();
          const config = await configRepo.getForTenant();
          return {
            memberCount: members.length,
            planKey: plan?.key ?? null,
            industryPack: config?.industryPack ?? null,
          };
        },
      );
      return {
        id: org._id,
        name: org.name,
        slug: org.slug,
        status: org.status,
        createdAt: org.createdAt,
        ownerEmail: ownerUser?.email ?? null,
        memberCount,
        planKey,
        industry: industryPack
          ? (getSolutionPack(industryPack)?.label ?? industryPack)
          : null,
      };
    }),
  );

  return NextResponse.json({ tenants });
}

export async function POST(req: Request) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const {
    organizationName,
    slug,
    ownerEmail,
    ownerName,
    ownerPassword,
    industryPackKey,
    intake,
    modules,
  } = body ?? {};
  const validKeys = new Set(MODULE_CATALOG.map((m) => m.key));
  const modulesOverride: ModuleKey[] | undefined = Array.isArray(modules)
    ? (modules.filter((m: string) => validKeys.has(m as ModuleKey)) as ModuleKey[])
    : undefined;
  if (!organizationName || !slug || !ownerEmail || !ownerPassword) {
    return NextResponse.json(
      {
        error:
          "organizationName, slug, ownerEmail, and ownerPassword are required",
      },
      { status: 400 },
    );
  }
  if (industryPackKey && !getSolutionPack(industryPackKey)) {
    return NextResponse.json(
      { error: `Unknown industry pack: ${industryPackKey}` },
      { status: 400 },
    );
  }

  try {
    const userRepo = await getUserRepository();
    const existing = await userRepo.findByEmail(ownerEmail);
    if (existing) {
      return NextResponse.json(
        { error: "A user with that owner email already exists" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(ownerPassword);
    // Admin-created owners are trusted, so they skip the email-verification
    // step a self-serve signup would require.
    const ownerUser = await userRepo.create({
      email: String(ownerEmail).toLowerCase(),
      emailVerified: new Date(),
      name: ownerName,
      passwordHash,
      mfaEnabled: false,
      mfaSecret: null,
      mfaRecoveryCodesHash: [],
      sessionVersion: 0,
      status: "active",
    } as Omit<UserRecord, "_id" | "createdAt" | "updatedAt">);

    const org = await createOrganizationForNewUser({
      organizationName,
      slug,
      ownerUserId: ownerUser._id,
      ownerEmail: ownerUser.email,
    });

    // Apply the chosen Industry Solution Pack: enable its modules, store the
    // captured intake + terminology, and set regional defaults. Config-driven,
    // no per-vertical code fork.
    // Apply a pack when one is chosen, or when the admin hand-picked modules
    // (falling back to "general" for terminology/defaults in the custom case).
    if (industryPackKey || modulesOverride) {
      await runWithTenantContext(
        { tenantId: org._id, userId: owner.userId },
        async () =>
          applySolutionPack(
            industryPackKey ?? "general",
            (intake ?? {}) as Record<string, string>,
            modulesOverride,
          ),
      );
    }

    return NextResponse.json(
      { tenantId: org._id, ownerUserId: ownerUser._id },
      { status: 201 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create tenant";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
