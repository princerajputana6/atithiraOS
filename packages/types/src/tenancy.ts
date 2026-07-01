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
  featureFlags: Record<string, boolean>;
}
