import { getTenantContext } from "@atithira/db";
import type {
  MarketplaceListing,
  TenantInstallation,
  MarketplaceCharge,
  ListingType,
} from "@atithira/types";
import {
  getListingRepository,
  getInstallationRepository,
  getChargeRepository,
} from "./repositories";

function requireCtx() {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  return ctx;
}

/* ------------------------------ Listings ----------------------------- */

export interface PublishListingInput {
  type: ListingType;
  slug: string;
  name: string;
  description: string;
  priceMonthly?: number;
  currency?: string;
  publisherName: string;
}

/** Publishes a listing owned by the current tenant. Call inside tenant context. */
export async function publishListing(
  input: PublishListingInput,
): Promise<MarketplaceListing> {
  const ctx = requireCtx();
  const repo = await getListingRepository();
  const existing = await repo.findBySlug(input.slug);
  if (existing) throw new Error(`Listing slug "${input.slug}" is taken`);
  return repo.create({
    type: input.type,
    slug: input.slug,
    name: input.name,
    description: input.description,
    priceMonthly: input.priceMonthly ?? 0,
    currency: input.currency ?? "INR",
    revenueSharePct: 20, // platform take, per doc §12 (15–30%)
    publisherTenantId: ctx.tenantId,
    publisherName: input.publisherName,
    status: "published",
  });
}

export async function listPublishedListings(): Promise<MarketplaceListing[]> {
  return (await getListingRepository()).listPublished();
}

export async function listMyListings(): Promise<MarketplaceListing[]> {
  const ctx = requireCtx();
  return (await getListingRepository()).listForPublisher(ctx.tenantId);
}

/* ---------------------------- Installation --------------------------- */

/**
 * Installs a published listing onto the current tenant and — for paid
 * listings — records a marketplace charge with the platform/publisher revenue
 * split. This is the "installed on a tenant, and billed" half of the Phase 4
 * gate. No payment gateway yet; the charge is a billing record.
 */
export async function installListing(
  listingId: string,
): Promise<{ installation: TenantInstallation; charge: MarketplaceCharge | null }> {
  const ctx = requireCtx();
  const listingRepo = await getListingRepository();
  const listing = await listingRepo.findById(listingId);
  if (!listing || listing.status !== "published") {
    throw new Error("Listing not found or not published");
  }

  const installRepo = await getInstallationRepository();
  const existing = await installRepo.findByListing(listingId);
  if (existing && existing.status === "active") {
    throw new Error("Already installed");
  }

  const installation = await installRepo.insertOne(
    {
      listingId,
      listingSlug: listing.slug,
      status: "active",
      config: {},
      installedAt: new Date(),
    } as Omit<TenantInstallation, "_id" | "tenantId">,
    { action: "marketplace.installed" },
  );

  let charge: MarketplaceCharge | null = null;
  if (listing.priceMonthly > 0) {
    const chargeRepo = await getChargeRepository();
    const platformFee = Math.round(
      (listing.priceMonthly * listing.revenueSharePct) / 100,
    );
    charge = await chargeRepo.insertOne(
      {
        listingId,
        amount: listing.priceMonthly,
        currency: listing.currency,
        platformFee,
        publisherEarnings: listing.priceMonthly - platformFee,
        publisherTenantId: listing.publisherTenantId,
        period: new Date().toISOString().slice(0, 7),
        createdAt: new Date(),
      } as Omit<MarketplaceCharge, "_id" | "tenantId">,
      { action: "marketplace.charged" },
    );
  }

  return { installation, charge };
}

export async function listInstallations(): Promise<TenantInstallation[]> {
  return (await getInstallationRepository()).listActive();
}

export async function uninstall(installationId: string): Promise<void> {
  const repo = await getInstallationRepository();
  await repo.setStatus(installationId, "uninstalled");
}

/* ------------------------- First-party seed -------------------------- */

const FIRST_PARTY_LISTINGS: PublishListingInput[] = [
  {
    type: "module",
    slug: "restaurant-pack",
    name: "Restaurant Solution Pack",
    description:
      "CRM (guests) + Inventory (ingredients) + Finance (billing/GST) preset for restaurants.",
    priceMonthly: 0,
    publisherName: "Atithira",
  },
  {
    type: "integration",
    slug: "razorpay-payments",
    name: "Razorpay Payments",
    description: "Collect invoice payments via Razorpay & UPI.",
    priceMonthly: 499,
    publisherName: "Atithira",
  },
  {
    type: "ai",
    slug: "sales-forecast-ai",
    name: "Sales Forecast AI",
    description: "Predict next-quarter sales from your CRM pipeline.",
    priceMonthly: 999,
    publisherName: "Atithira",
  },
  {
    type: "theme",
    slug: "midnight-theme",
    name: "Midnight Portal Theme",
    description: "A sleek dark theme for your customer portal.",
    priceMonthly: 199,
    publisherName: "Atithira",
  },
  {
    type: "workflow",
    slug: "lead-nurture-flow",
    name: "Lead Nurture Automation",
    description: "Prebuilt rules to follow up with new leads automatically.",
    priceMonthly: 0,
    publisherName: "Atithira",
  },
];

/** Idempotent seed of first-party listings (publisherTenantId = null). */
export async function seedFirstPartyListings(): Promise<void> {
  const repo = await getListingRepository();
  for (const l of FIRST_PARTY_LISTINGS) {
    await repo.upsertBySlug({
      type: l.type,
      slug: l.slug,
      name: l.name,
      description: l.description,
      priceMonthly: l.priceMonthly ?? 0,
      currency: "INR",
      revenueSharePct: 20,
      publisherTenantId: null,
      publisherName: l.publisherName,
      status: "published",
    });
  }
}
