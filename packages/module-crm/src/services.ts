import { getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import type {
  Contact,
  Lead,
  Deal,
  DealStage,
} from "@atithira/types";
import {
  getContactRepository,
  getLeadRepository,
  getDealRepository,
} from "./repositories";

function requireCtx() {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  return ctx;
}

/* ------------------------------ Contacts ----------------------------- */

export interface CreateContactInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export async function createContact(input: CreateContactInput): Promise<Contact> {
  const ctx = requireCtx();
  const repo = await getContactRepository();
  return repo.insertOne({
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    ownerUserId: ctx.userId ?? "",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Contact, "_id" | "tenantId">);
}

export async function listContacts(): Promise<Contact[]> {
  const repo = await getContactRepository();
  return repo.list();
}

/* -------------------------------- Leads ------------------------------ */

export interface CreateLeadInput {
  name: string;
  email?: string;
  company?: string;
  source?: string;
  score?: number;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const ctx = requireCtx();
  const repo = await getLeadRepository();
  const lead = await repo.insertOne({
    name: input.name,
    email: input.email,
    company: input.company,
    source: input.source,
    status: "new",
    score: input.score ?? 0,
    ownerUserId: ctx.userId ?? "",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Lead, "_id" | "tenantId">);

  await publishEvent("crm/lead.created", {
    tenantId: ctx.tenantId,
    leadId: String(lead._id),
    name: lead.name,
    ownerUserId: lead.ownerUserId,
  });

  return lead;
}

export async function listLeads(): Promise<Lead[]> {
  const repo = await getLeadRepository();
  return repo.list();
}

/* -------------------------------- Deals ------------------------------ */

export interface CreateDealInput {
  title: string;
  amount: number;
  currency?: string;
  contactId?: string;
  stage?: DealStage;
}

export async function createDeal(input: CreateDealInput): Promise<Deal> {
  const ctx = requireCtx();
  const repo = await getDealRepository();
  return repo.insertOne({
    title: input.title,
    amount: input.amount,
    currency: input.currency ?? "INR",
    contactId: input.contactId,
    stage: input.stage ?? "qualified",
    ownerUserId: ctx.userId ?? "",
    expectedCloseDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Deal, "_id" | "tenantId">);
}

export async function listDeals(): Promise<Deal[]> {
  const repo = await getDealRepository();
  return repo.list();
}

export async function moveDeal(
  dealId: string,
  stage: DealStage,
): Promise<void> {
  const ctx = requireCtx();
  const repo = await getDealRepository();
  await repo.updateStage(dealId, stage);

  if (stage === "won") {
    const deals = await repo.list();
    const deal = deals.find((d) => String(d._id) === dealId);
    if (deal) {
      await publishEvent("crm/deal.won", {
        tenantId: ctx.tenantId,
        dealId,
        title: deal.title,
        amount: deal.amount,
        currency: deal.currency,
      });
    }
  }
}
