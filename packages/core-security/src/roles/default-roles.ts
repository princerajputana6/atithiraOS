import { PERMISSIONS, WILDCARD_PERMISSION } from "../permissions/catalog";
import type { DefaultRoleKey } from "@atithira/types";

// CRM module permission strings. Duplicated here (rather than imported from
// @atithira/module-crm) on purpose: the kernel must never depend on a module
// package. These are the same literals module-crm registers in its own
// CRM_PERMISSIONS. When more modules ship, each contributes its default-role
// grants the same way.
const CRM_PERMISSION_STRINGS = [
  "crm.contact.read",
  "crm.contact.write",
  "crm.lead.read",
  "crm.lead.write",
  "crm.deal.read",
  "crm.deal.write",
];

// Module permission strings granted to standard roles. Duplicated here rather
// than imported from each @atithira/module-* package because the kernel must
// never depend on a module. Each module registers the same literals in its
// own <MODULE>_PERMISSIONS. business_admin gets the approval-level grants;
// employee gets read/write on operational records.
const FINANCE_PERMISSION_STRINGS = [
  "finance.invoice.read",
  "finance.invoice.write",
  "finance.expense.read",
  "finance.expense.write",
];
const PEOPLE_PERMISSION_STRINGS = [
  "people.employee.read",
  "people.employee.write",
  "people.attendance.read",
  "people.attendance.write",
  "people.leave.read",
  "people.leave.write",
];
const INVENTORY_PERMISSION_STRINGS = [
  "inventory.product.read",
  "inventory.product.write",
  "inventory.stock.write",
];
// Procurement: read/write vendors + POs is everyday work; receiving a PO
// (which pushes stock into inventory) is an admin-level action.
const PROCUREMENT_PERMISSION_STRINGS = [
  "procurement.vendor.read",
  "procurement.vendor.write",
  "procurement.po.read",
  "procurement.po.write",
];
const PROJECTS_PERMISSION_STRINGS = [
  "projects.project.read",
  "projects.project.write",
  "projects.task.read",
  "projects.task.write",
];
const RESTAURANT_PERMISSION_STRINGS = [
  "restaurant.menu.read",
  "restaurant.menu.write",
  "restaurant.table.manage",
  "restaurant.reservation.manage",
  "restaurant.order.read",
  "restaurant.order.write",
];
const VERTICAL_PERMISSION_STRINGS = [
  // Hotel
  "hotel.room.manage",
  "hotel.booking.read",
  "hotel.booking.write",
  // Clinic
  "clinic.patient.read",
  "clinic.patient.write",
  "clinic.appointment.read",
  "clinic.appointment.write",
  // Retail POS
  "retail.sale.read",
  "retail.sale.write",
];
const WEBSITE_PERMISSION_STRINGS = [
  "website.page.read",
  "website.page.write",
  "website.form.read",
  "website.form.write",
  "website.submission.read",
];
// Workflow rule.read/write is admin-level; notification.read (also the gate
// for the AI Copilot) is granted to everyone.
const WORKFLOW_READ_PERMISSION_STRINGS = ["workflow.notification.read"];
const WORKFLOW_ADMIN_PERMISSION_STRINGS = [
  "workflow.rule.read",
  "workflow.rule.write",
  "workflow.notification.read",
];
// Marketplace browse/install belongs to everyone; publishing + API-key
// management is admin/developer-level.
const MARKETPLACE_READ_PERMISSION_STRINGS = [
  "marketplace.browse",
  "marketplace.install",
];
const DEVELOPER_ADMIN_PERMISSION_STRINGS = [
  "marketplace.listing.publish",
  "developer.apikey.manage",
];

const MODULE_EMPLOYEE_PERMISSIONS = [
  ...CRM_PERMISSION_STRINGS,
  ...FINANCE_PERMISSION_STRINGS,
  ...PEOPLE_PERMISSION_STRINGS,
  ...INVENTORY_PERMISSION_STRINGS,
  ...PROCUREMENT_PERMISSION_STRINGS,
  ...PROJECTS_PERMISSION_STRINGS,
  ...RESTAURANT_PERMISSION_STRINGS,
  ...VERTICAL_PERMISSION_STRINGS,
  ...WEBSITE_PERMISSION_STRINGS,
  ...WORKFLOW_READ_PERMISSION_STRINGS,
  ...MARKETPLACE_READ_PERMISSION_STRINGS,
];

// Approval-level permissions that belong to admins, not rank-and-file staff.
const MODULE_ADMIN_PERMISSIONS = [
  ...MODULE_EMPLOYEE_PERMISSIONS,
  ...WORKFLOW_ADMIN_PERMISSION_STRINGS,
  ...DEVELOPER_ADMIN_PERMISSION_STRINGS,
  "finance.expense.approve",
  "finance.gl.read",
  "people.leave.approve",
  "people.payroll.read",
  "people.payroll.manage",
  "procurement.po.receive",
  PERMISSIONS.REPORTING_READ,
];

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
      PERMISSIONS.SECURITY_SSO_MANAGE,
      ...MODULE_ADMIN_PERMISSIONS,
    ],
    seedPerTenant: true,
  },
  {
    key: "department_manager",
    name: "Department Manager",
    permissions: [
      PERMISSIONS.SECURITY_MEMBER_MANAGE,
      ...MODULE_ADMIN_PERMISSIONS,
    ],
    seedPerTenant: true,
  },
  {
    key: "employee",
    name: "Employee",
    // Read + write on operational module records so a rank-and-file user can
    // do day-to-day work, but not approval-level actions.
    permissions: [...MODULE_EMPLOYEE_PERMISSIONS],
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
