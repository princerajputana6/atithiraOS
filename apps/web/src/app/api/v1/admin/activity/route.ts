import { NextResponse } from "next/server";
import { getUserRepository } from "@atithira/core-identity";
import { getOrganizationRepository } from "@atithira/core-tenancy";
import { getAuditLogRepository } from "@atithira/core-security";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { resolvePlatformOwner } from "@/lib/admin";

const PER_TENANT_LIMIT = 5;
const FEED_LIMIT = 25;

export async function GET() {
  await ensureBootstrapped();
  const owner = await resolvePlatformOwner();
  if (!owner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgRepo = await getOrganizationRepository();
  const orgs = await orgRepo.listAll();

  const perTenantEntries = await Promise.all(
    orgs.map((org) =>
      runWithTenantContext({ tenantId: org._id, userId: null }, async () => {
        const auditRepo = await getAuditLogRepository();
        const entries = await auditRepo.list(PER_TENANT_LIMIT);
        return entries.map((entry) => ({ ...entry, tenantName: org.name }));
      }),
    ),
  );

  const merged = perTenantEntries
    .flat()
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, FEED_LIMIT);

  const userRepo = await getUserRepository();
  const actorIds = [
    ...new Set(merged.map((e) => e.actorUserId).filter((id): id is string => !!id)),
  ];
  const actors = await Promise.all(actorIds.map((id) => userRepo.findById(id)));
  const emailByActorId = new Map(
    actors.filter((a) => a).map((a) => [a!._id, a!.email]),
  );

  const activity = merged.map((entry) => ({
    id: entry._id,
    tenantName: entry.tenantName,
    action: entry.action,
    targetType: entry.targetType,
    actorType: entry.actorType,
    actorEmail: entry.actorUserId
      ? (emailByActorId.get(entry.actorUserId) ?? null)
      : null,
    createdAt: entry.createdAt,
  }));

  return NextResponse.json({ activity });
}
