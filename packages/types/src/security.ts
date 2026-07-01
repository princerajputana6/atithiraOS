export type DefaultRoleKey =
  | "org_owner"
  | "business_admin"
  | "department_manager"
  | "employee"
  | "customer"
  | "vendor"
  | "partner"
  | "developer"
  | "platform_owner";

export interface Role {
  _id: string;
  // Every persisted Role belongs to exactly one tenant. Roles that aren't yet
  // auto-seeded (customer/vendor/partner/developer/platform_owner) exist only
  // as DEFAULT_ROLE_TEMPLATES in code until a later phase gives them a real
  // per-tenant or platform-level surface to seed into.
  tenantId: string;
  key: string;
  name: string;
  permissions: string[]; // e.g. "crm.lead.read", "*" for full access
  isSystemDefault: boolean;
}

export type RoleBindingScopeLevel = "org" | "branch" | "department";

export interface RoleBindingScope {
  level: RoleBindingScopeLevel;
  branchId?: string;
  departmentId?: string;
}

export interface RoleBinding {
  _id: string;
  tenantId: string;
  userId: string;
  roleId: string;
  scope: RoleBindingScope;
  createdAt: Date;
}

export interface AuditLogEntry {
  _id: string;
  tenantId: string;
  actorUserId: string | null;
  actorType: "user" | "system" | "platform_owner";
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
