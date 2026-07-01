export type ListingType =
  | "module"
  | "theme"
  | "workflow"
  | "ai"
  | "integration";

export const LISTING_TYPES: ListingType[] = [
  "module",
  "theme",
  "workflow",
  "ai",
  "integration",
];

export type ListingStatus = "draft" | "published";

export interface MarketplaceListing {
  _id: string;
  // Global catalog — NOT tenant-scoped. publisherTenantId identifies who
  // published it (null for first-party Atithira listings).
  type: ListingType;
  slug: string;
  name: string;
  description: string;
  priceMonthly: number; // 0 = free
  currency: string;
  revenueSharePct: number; // platform's take (15–30 per doc §12)
  publisherTenantId: string | null;
  publisherName: string;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type InstallationStatus = "active" | "uninstalled";

export interface TenantInstallation {
  _id: string;
  tenantId: string;
  listingId: string;
  listingSlug: string;
  status: InstallationStatus;
  config: Record<string, string>;
  installedAt: Date;
}

export interface MarketplaceCharge {
  _id: string;
  tenantId: string; // the installing tenant being billed
  listingId: string;
  amount: number;
  currency: string;
  platformFee: number; // revenueSharePct of amount
  publisherEarnings: number; // amount - platformFee
  publisherTenantId: string | null;
  period: string; // YYYY-MM
  createdAt: Date;
}
