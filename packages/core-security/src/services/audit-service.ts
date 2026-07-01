import { registerAuditHook, type AuditHookContext } from "@atithira/db";
import { getAuditLogRepository } from "../collections";

export async function recordAudit(ctx: AuditHookContext): Promise<void> {
  const repo = await getAuditLogRepository();
  await repo.append({
    actorUserId: ctx.actorUserId,
    actorType: ctx.actorUserId ? "user" : "system",
    action: ctx.action,
    targetType: ctx.targetType,
    targetId: ctx.targetId,
    metadata: ctx.metadata,
    createdAt: new Date(),
  });
}

/**
 * Wires this service in as @atithira/db's audit hook, so every
 * TenantScopedRepository write anywhere in the app is recorded here
 * automatically. Must be imported once at app boot (see core-security's
 * index.ts) before any tenant-scoped write happens.
 */
export function installAuditHook(): void {
  registerAuditHook(recordAudit);
}
