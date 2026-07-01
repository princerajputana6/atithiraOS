/**
 * Phase 1 permission catalog. Business modules (CRM, Finance, HR, ...) will
 * register their own `<module>.<resource>.<action>` strings in later phases;
 * this list only covers what the kernel itself needs to gate.
 */
export const PERMISSIONS = {
  TENANCY_ORG_MANAGE: "tenancy.organization.manage",
  TENANCY_BRANCH_MANAGE: "tenancy.branch.manage",
  TENANCY_DEPARTMENT_MANAGE: "tenancy.department.manage",
  TENANCY_CONFIG_MANAGE: "tenancy.config.manage",
  SECURITY_ROLE_MANAGE: "security.role.manage",
  SECURITY_MEMBER_MANAGE: "security.member.manage",
  SECURITY_AUDIT_READ: "security.audit.read",
  BILLING_SUBSCRIPTION_MANAGE: "billing.subscription.manage",
  BILLING_SUBSCRIPTION_READ: "billing.subscription.read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** The wildcard permission — only ever granted to org_owner and platform_owner. */
export const WILDCARD_PERMISSION = "*";
