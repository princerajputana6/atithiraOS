export type TenantLifecycleState = "trial" | "active" | "suspended" | "churned";

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  status: TenantLifecycleState;
  trialEndsAt: Date | null;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  _id: string;
  tenantId: string;
  name: string;
  code: string;
  address?: string;
  isHQ: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  _id: string;
  tenantId: string;
  branchId: string;
  name: string;
  code: string;
  parentDepartmentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantConfig {
  _id: string;
  tenantId: string;
  branding: {
    logoUrl?: string;
    primaryColor?: string;
  };
  locale: string;
  currency: string;
  timezone: string;
  /** The industry Solution Pack applied at provisioning (MASTER_PLAN §7). */
  industryPack?: string;
  /** Vertical terminology overrides, e.g. { contacts: "Guests" }. */
  terminology?: Record<string, string>;
  /** Captured onboarding requirements (the dynamic intake answers). */
  intake?: Record<string, string>;
  /**
   * Per-module entitlements, keyed by ModuleKey. A missing key means "use the
   * catalog default" (see MODULE_CATALOG.defaultEnabled) — so existing tenants
   * with an empty map inherit sensible defaults without a migration. An
   * explicit true/false is a Platform-Owner override.
   */
  featureFlags: Record<string, boolean>;
  /**
   * A tenant's own payment gateway, used to accept online payments from their
   * website visitors (bookings/orders) into the tenant's own account. The
   * secret is stored encrypted at rest — never returned to the client. Absent
   * until the tenant connects a gateway from Settings → Payments.
   */
  payment?: TenantPaymentConfig;
}

export type PaymentProvider = "razorpay";

export interface TenantPaymentConfig {
  provider: PaymentProvider;
  /** Publishable key id (safe to expose to the browser at checkout). */
  keyId: string;
  /** AES-256-GCM encrypted key secret (see core-tenancy payment service). */
  encryptedKeySecret: string;
  /** When false, online payment is disabled even though credentials exist. */
  enabled: boolean;
  updatedAt: Date;
}

/* --------------------------- Module entitlements --------------------------- */

export type ModuleKey =
  | "crm"
  | "restaurant"
  | "hotel"
  | "clinic"
  | "retail"
  | "finance"
  | "people"
  | "inventory"
  | "procurement"
  | "projects"
  | "intelligence"
  | "automation"
  | "website"
  | "marketplace"
  | "developer";

export interface PlatformModule {
  key: ModuleKey;
  label: string;
  description: string;
  /** Seeded/assumed enabled for a fresh tenant unless a Platform Owner overrides it. */
  defaultEnabled: boolean;
}

/**
 * The canonical list of grantable product modules. This is pure configuration
 * (no logic), so it lives in @atithira/types and is consumed by the kernel
 * (entitlement resolution), the tenant UI (sidebar gating), and the
 * Platform-Owner admin console (the feature-granting toggles) alike.
 */
export const MODULE_CATALOG: PlatformModule[] = [
  { key: "crm", label: "CRM", description: "Contacts, leads, and deal pipeline.", defaultEnabled: true },
  { key: "restaurant", label: "Restaurant", description: "Menu, QR table ordering, reservations, and orders.", defaultEnabled: false },
  { key: "hotel", label: "Hotel", description: "Rooms and guest bookings with check-in / check-out.", defaultEnabled: false },
  { key: "clinic", label: "Clinic", description: "Patient records and appointment scheduling.", defaultEnabled: false },
  { key: "retail", label: "Retail POS", description: "Point-of-sale checkout that decrements inventory stock.", defaultEnabled: false },
  { key: "finance", label: "Finance", description: "Invoicing, expenses, GST, and the general ledger.", defaultEnabled: true },
  { key: "people", label: "People", description: "Employees, attendance, leave, and payroll.", defaultEnabled: true },
  { key: "inventory", label: "Inventory", description: "Products, stock levels, and movements.", defaultEnabled: true },
  { key: "procurement", label: "Procurement", description: "Vendors and purchase orders that receive into inventory.", defaultEnabled: false },
  { key: "projects", label: "Projects", description: "Projects and tasks.", defaultEnabled: true },
  { key: "intelligence", label: "Intelligence", description: "Dashboards, cross-module reports, and the AI Copilot.", defaultEnabled: true },
  { key: "automation", label: "Automation", description: "No-code workflow rules and notifications.", defaultEnabled: false },
  { key: "website", label: "Website", description: "Tenant-hosted website builder.", defaultEnabled: false },
  { key: "marketplace", label: "Marketplace", description: "Install first- and third-party modules.", defaultEnabled: false },
  { key: "developer", label: "Developer", description: "API keys and marketplace publishing.", defaultEnabled: false },
];

/** Resolves the effective on/off state for every module given a tenant's featureFlags overrides. */
export function resolveModuleAccess(
  featureFlags: Record<string, boolean> | undefined,
): Record<ModuleKey, boolean> {
  const flags = featureFlags ?? {};
  const result = {} as Record<ModuleKey, boolean>;
  for (const mod of MODULE_CATALOG) {
    result[mod.key] = flags[mod.key] ?? mod.defaultEnabled;
  }
  return result;
}
