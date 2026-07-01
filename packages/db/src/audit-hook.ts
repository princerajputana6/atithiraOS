export interface AuditHookContext {
  tenantId: string;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}

export type AuditHook = (ctx: AuditHookContext) => Promise<void> | void;

// @atithira/core-security registers itself here at module load time. Kept as
// a pluggable hook (rather than core-security importing db and db importing
// core-security back) to avoid a circular package dependency, since
// core-security's own repositories (roles, role_bindings, audit_logs) extend
// TenantScopedRepository from this package.
let auditHook: AuditHook | null = null;

export function registerAuditHook(hook: AuditHook): void {
  auditHook = hook;
}

export async function runAuditHook(ctx: AuditHookContext): Promise<void> {
  if (!auditHook) return;
  await auditHook(ctx);
}
