import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type {
  MarketplaceListing,
  TenantInstallation,
  MarketplaceCharge,
  ListingStatus,
} from "@atithira/types";

/**
 * Global catalog — NOT tenant-scoped. Anyone can browse published listings;
 * publishers see their own drafts. This is the one marketplace collection that
 * intentionally spans tenants (it's a shared storefront).
 */
export class ListingRepository {
  constructor(private readonly collection: Collection<MarketplaceListing>) {}

  async create(
    listing: Omit<MarketplaceListing, "_id" | "createdAt" | "updatedAt">,
  ): Promise<MarketplaceListing> {
    const now = new Date();
    const doc = { ...listing, createdAt: now, updatedAt: now } as MarketplaceListing;
    const result = await this.collection.insertOne(doc);
    return { ...doc, _id: String(result.insertedId) };
  }

  async findById(id: string): Promise<MarketplaceListing | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) } as never);
    return doc ? { ...doc, _id: String(doc._id) } : null;
  }

  async findBySlug(slug: string): Promise<MarketplaceListing | null> {
    return this.collection.findOne({ slug } as Filter<MarketplaceListing>);
  }

  async listPublished(): Promise<MarketplaceListing[]> {
    const docs = await this.collection
      .find({ status: "published" } as Filter<MarketplaceListing>)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => ({ ...d, _id: String(d._id) }));
  }

  async listForPublisher(publisherTenantId: string): Promise<MarketplaceListing[]> {
    const docs = await this.collection
      .find({ publisherTenantId } as Filter<MarketplaceListing>)
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => ({ ...d, _id: String(d._id) }));
  }

  async setStatus(id: string, status: ListingStatus): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
    );
  }

  async upsertBySlug(
    listing: Omit<MarketplaceListing, "_id" | "createdAt" | "updatedAt">,
  ): Promise<void> {
    await this.collection.updateOne(
      { slug: listing.slug } as Filter<MarketplaceListing>,
      { $set: { ...listing, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
}

export class InstallationRepository extends TenantScopedRepository<TenantInstallation> {
  protected readonly targetType = "installation";
  constructor(collection: Collection<TenantInstallation>) {
    super(collection);
  }
  listActive() {
    return this.find({ status: "active" } as Filter<TenantInstallation>);
  }
  findByListing(listingId: string) {
    return this.findOne({ listingId } as Filter<TenantInstallation>);
  }
  setStatus(id: string, status: "active" | "uninstalled") {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status } },
      { action: `installation.${status}` },
    );
  }
}

export class ChargeRepository extends TenantScopedRepository<MarketplaceCharge> {
  protected readonly targetType = "marketplace_charge";
  constructor(collection: Collection<MarketplaceCharge>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
}

export async function getListingRepository() {
  const db = await getDb();
  return new ListingRepository(
    db.collection<MarketplaceListing>("marketplace_listings"),
  );
}
export async function getInstallationRepository() {
  const db = await getDb();
  return new InstallationRepository(
    db.collection<TenantInstallation>("marketplace_installations"),
  );
}
export async function getChargeRepository() {
  const db = await getDb();
  return new ChargeRepository(
    db.collection<MarketplaceCharge>("marketplace_charges"),
  );
}
