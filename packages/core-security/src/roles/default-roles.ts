import { PERMISSIONS, WILDCARD_PERMISSION } from "../permissions/catalog";
import type { DefaultRoleKey } from "@atithira/types";

export interface DefaultRoleTemplate {
  key: DefaultRoleKey;
  name: string;
  permissions: string[];
  /** Seeded into every new tenant automatically. Platform Owner is global-only. */
  seedPerTenant: boolean;
}

// Only the roles Phase 1 has a real surface for are seeded automatically.
// Customer/Vendor/Partner/Developer roles are defined here per the doc's role
// table so later phases can seed them without a schema change, but they are
// not auto-assigned yet since no portal/marketplace surface exists for them.
export const DEFAULT_ROLE_TEMPLATES: DefaultRoleTemplate[] = [
  {
    key: "org_owner",
    name: "Organization Owner",
    permissions: [WILDCARD_PERMISSION],
    seedPerTenant: true,
  },
  {
    key: "business_admin",
    name: "Business Administrator",
    permissions: [
      PERMISSIONS.TENANCY_BRANCH_MANAGE,
      PERMISSIONS.TENANCY_DEPARTMENT_MANAGE,
      PERMISSIONS.TENANCY_CONFIG_MANAGE,
      PERMISSIONS.SECURITY_ROLE_MANAGE,
      PERMISSIONS.SECURITY_MEMBER_MANAGE,
      PERMISSIONS.SECURITY_AUDIT_READ,
    ],
    seedPerTenant: true,
  },
  {
    key: "department_manager",
    name: "Department Manager",
    permissions: [PERMISSIONS.SECURITY_MEMBER_MANAGE],
    seedPerTenant: true,
  },
  {
    key: "employee",
    name: "Employee",
    permissions: [],
    seedPerTenant: true,
  },
  {
    key: "customer",
    name: "Customer",
    permissions: [],
    seedPerTenant: false,
  },
  {
    key: "vendor",
    name: "Vendor",
    permissions: [],
    seedPerTenant: false,
  },
  {
    key: "partner",
    name: "Partner",
    permissions: [],
    seedPerTenant: false,
  },
  {
    key: "developer",
    name: "Developer",
    permissions: [],
    seedPerTenant: false,
  },
  {
    key: "platform_owner",
    name: "Platform Owner",
    permissions: [WILDCARD_PERMISSION],
    seedPerTenant: false,
  },
];
