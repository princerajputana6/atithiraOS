export { PERMISSIONS, WILDCARD_PERMISSION, type Permission } from "./permissions/catalog";
export { DEFAULT_ROLE_TEMPLATES, type DefaultRoleTemplate } from "./roles/default-roles";

export { RoleRepository } from "./repositories/role-repository";
export { RoleBindingRepository } from "./repositories/role-binding-repository";
export { AuditLogRepository } from "./repositories/audit-log-repository";
export {
  getRoleRepository,
  getRoleBindingRepository,
  getAuditLogRepository,
} from "./collections";

export {
  seedDefaultRolesForTenant,
  assignRole,
  can,
  getRolesForUser,
} from "./services/rbac-service";
export { recordAudit, installAuditHook } from "./services/audit-service";

export {
  registerAuthResolver,
  resolveActor,
  type AuthResolver,
  type ResolvedActor,
} from "./auth-resolver";
export { requirePermission } from "./middleware/require-permission";
