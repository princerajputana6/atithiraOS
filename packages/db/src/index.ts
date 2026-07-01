export { getMongoClientPromise, getDb } from "./client";
export {
  runWithTenantContext,
  getTenantContext,
  type TenantContext,
} from "./tenant-context";
export { TenantContextMissingError } from "./errors";
export {
  registerAuditHook,
  runAuditHook,
  type AuditHook,
  type AuditHookContext,
} from "./audit-hook";
export { TenantScopedRepository, type WriteOptions } from "./with-tenant";
