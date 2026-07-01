import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import { ensureTextIndex, textSearch } from "@atithira/core-search";
import type { Contact, Lead, Deal, DealStage } from "@atithira/types";

export class ContactRepository extends TenantScopedRepository<Contact> {
  protected readonly targetType = "contact";
  constructor(collection: Collection<Contact>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  async ensureSearchIndex() {
    await ensureTextIndex(this.collection, { name: "text", email: "text", company: "text" });
  }
  search(query: string) {
    return textSearch(this.collection, this.requireTenantId(), query);
  }
}

export class LeadRepository extends TenantScopedRepository<Lead> {
  protected readonly targetType = "lead";
  constructor(collection: Collection<Lead>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  async ensureSearchIndex() {
    await ensureTextIndex(this.collection, { name: "text", email: "text", company: "text" });
  }
  search(query: string) {
    return textSearch(this.collection, this.requireTenantId(), query);
  }
}

export class DealRepository extends TenantScopedRepository<Deal> {
  protected readonly targetType = "deal";
  constructor(collection: Collection<Deal>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  updateStage(dealId: string, stage: DealStage) {
    return this.updateOne(
      { _id: new ObjectId(dealId) } as never,
      { $set: { stage, updatedAt: new Date() } },
      { action: "deal.stage_changed" },
    );
  }
}

export async function getContactRepository() {
  const db = await getDb();
  return new ContactRepository(db.collection<Contact>("crm_contacts"));
}

export async function getLeadRepository() {
  const db = await getDb();
  return new LeadRepository(db.collection<Lead>("crm_leads"));
}

export async function getDealRepository() {
  const db = await getDb();
  return new DealRepository(db.collection<Deal>("crm_deals"));
}
