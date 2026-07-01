import { NextResponse } from "next/server";
import {
  transitionTenantStatus,
  deleteTenant,
  getOrganizationRepository,
  getMembershipRepository,
} from "@atithira/core-tenancy";
import { getUserRepository } from "@atithira/core-identity";
import { getActivePlan } from "@atithira/core-billing";
import { runWithTenantContext } from "@atithira/db";
import type { TenantLifecycleState } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";

const VALID_STATES: TenantLifecycleState[] = [
  "trial",
  "active",
  "suspended",
  "churned",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { tenantId } = await params;
  const orgRepo = await getOrganizationRepository();
  const org = await orgRepo.findById(tenantId);
  if (!org) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const userRepo = await getUserRepository();
  const ownerUser = await userRepo.findById(org.ownerUserId);

  const { memberCount, planKey } = await runWithTenantContext(
    { tenantId, userId: null },
    async () => {
      const membershipRepo = await getMembershipRepository();
      const members = await membershipRepo.listMembers();
      const plan = await getActivePlan();
      return { memberCount: members.length, planKey: plan?.key ?? null };
    },
  );

  return NextResponse.json({
    tenant: {
      id: org._id,
      name: org.name,
      slug: org.slug,
      status: org.status,
      createdAt: org.createdAt,
      trialEndsAt: org.trialEndsAt,
      ownerEmail: ownerUser?.email ?? null,
      memberCount,
      planKey,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { tenantId } = await params;
  const { status } = (await req.json().catch(() => ({}))) as {
    status?: TenantLifecycleState;
  };
  if (!status || !VALID_STATES.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATES.join(", ")}` },
      { status: 400 },
    );
  }

  await transitionTenantStatus(tenantId, status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { tenantId } = await params;
  const orgRepo = await getOrganizationRepository();
  const org = await orgRepo.findById(tenantId);
  if (!org) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const ownerUserId = org.ownerUserId;

  // Hard-delete the org + every tenant-scoped record.
  await deleteTenant(tenantId);

  // Clean up the owner identity too, but only when it isn't Platform staff and
  // doesn't own another workspace — a shared identity must never be deleted.
  const userRepo = await getUserRepository();
  const ownerUser = await userRepo.findById(ownerUserId);
  if (ownerUser && !ownerUser.isPlatformOwner) {
    const otherOrgs = await orgRepo.listByOwner(ownerUserId);
    if (otherOrgs.length === 0) {
      await userRepo.deleteById(ownerUserId);
    }
  }

  return NextResponse.json({ ok: true });
}
