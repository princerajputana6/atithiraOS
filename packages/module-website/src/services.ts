import { randomUUID } from "node:crypto";
import type {
  SitePage,
  SiteBlock,
  SiteForm,
  SiteFormField,
  FormSubmission,
  PageStatus,
  WebsiteBooking,
  WebsiteOrder,
  WebsiteOrderLine,
  FulfilmentStatus,
} from "@atithira/types";
import {
  getSitePageRepository,
  getSiteFormRepository,
  getFormSubmissionRepository,
  getWebsiteBookingRepository,
  getWebsiteOrderRepository,
} from "./repositories";

/* -------------------------------- Pages --------------------------------- */

export interface CreatePageInput {
  title: string;
  slug: string;
  isHome?: boolean;
}

export async function createPage(input: CreatePageInput): Promise<SitePage> {
  const repo = await getSitePageRepository();
  if (input.isHome) await repo.clearHome();
  return repo.insertOne(
    {
      title: input.title,
      slug: slugify(input.slug || input.title),
      blocks: [],
      status: "draft",
      isHome: input.isHome ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<SitePage, "_id" | "tenantId">,
    { action: "site_page.created" },
  );
}

export async function listPages(): Promise<SitePage[]> {
  return (await getSitePageRepository()).list();
}

export async function getPage(id: string): Promise<SitePage | null> {
  return (await getSitePageRepository()).findById(id);
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  blocks?: SiteBlock[];
  metaTitle?: string;
  metaDescription?: string;
  isHome?: boolean;
}

export async function updatePage(id: string, input: UpdatePageInput): Promise<void> {
  const repo = await getSitePageRepository();
  if (input.isHome) await repo.clearHome();
  const patch: Partial<SitePage> = { ...input };
  if (input.slug) patch.slug = slugify(input.slug);
  // Every block needs a stable id for the editor/renderer keys.
  if (input.blocks) {
    patch.blocks = input.blocks.map((b) => ({ ...b, id: b.id || randomUUID() }));
  }
  await repo.update(id, patch);
}

export async function setPageStatus(id: string, status: PageStatus): Promise<void> {
  await (await getSitePageRepository()).setStatus(id, status);
}

export async function deletePage(id: string): Promise<void> {
  await (await getSitePageRepository()).remove(id);
}

/** Public read: a published page by slug (or the home page when slug omitted). */
export async function getPublishedPage(slug?: string): Promise<SitePage | null> {
  const repo = await getSitePageRepository();
  const page = slug ? await repo.findBySlug(slug) : await repo.findHome();
  if (!page || page.status !== "published") return null;
  return page;
}

export async function listPublishedPages(): Promise<SitePage[]> {
  const pages = await (await getSitePageRepository()).list();
  return pages.filter((p) => p.status === "published");
}

/* -------------------------------- Forms --------------------------------- */

export interface CreateFormInput {
  name: string;
  fields: SiteFormField[];
  submitText?: string;
  createsLead?: boolean;
}

export async function createForm(input: CreateFormInput): Promise<SiteForm> {
  const repo = await getSiteFormRepository();
  return repo.insertOne(
    {
      name: input.name,
      fields: input.fields,
      submitText: input.submitText ?? "Submit",
      createsLead: input.createsLead ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<SiteForm, "_id" | "tenantId">,
    { action: "site_form.created" },
  );
}

export async function listForms(): Promise<SiteForm[]> {
  return (await getSiteFormRepository()).list();
}

export async function getForm(id: string): Promise<SiteForm | null> {
  return (await getSiteFormRepository()).findById(id);
}

export async function updateForm(
  id: string,
  input: Partial<CreateFormInput>,
): Promise<void> {
  await (await getSiteFormRepository()).update(id, input);
}

/**
 * Records a public form submission. Returns the stored submission; the caller
 * (app layer) is responsible for the cross-module CRM lead creation so this
 * module stays free of a direct dependency on module-crm.
 */
export async function recordSubmission(
  formId: string,
  data: Record<string, string>,
  leadId?: string | null,
): Promise<FormSubmission> {
  const repo = await getFormSubmissionRepository();
  return repo.insertOne(
    {
      formId,
      data,
      leadId: leadId ?? null,
      createdAt: new Date(),
    } as Omit<FormSubmission, "_id" | "tenantId">,
    { action: "form_submission.created", skipAudit: false },
  );
}

export async function listSubmissions(formId?: string): Promise<FormSubmission[]> {
  const repo = await getFormSubmissionRepository();
  return formId ? repo.listForForm(formId) : repo.list();
}

/* --------------------- Dynamic bookings & orders ------------------------ */

/** Parses a price string like "₹1,200" or "500" into paise. Empty/none → 0 (free). */
export function priceToPaise(display?: string): number {
  if (!display) return 0;
  const digits = display.replace(/[^0-9.]/g, "");
  const rupees = parseFloat(digits);
  return Number.isFinite(rupees) ? Math.round(rupees * 100) : 0;
}

export interface PublicCatalog {
  /** Bookable service name → price in paise (server-authoritative). */
  services: Map<string, number>;
  /** Orderable product name → unit price in paise (server-authoritative). */
  products: Map<string, number>;
}

/**
 * Builds the price catalog from a tenant's *published* pages by scanning every
 * `booking` and `menu` block. Public checkout uses this as the source of truth
 * for amounts so a visitor can never tamper with the price sent from the
 * browser.
 */
export async function getPublicCatalog(): Promise<PublicCatalog> {
  const pages = await listPublishedPages();
  const services = new Map<string, number>();
  const products = new Map<string, number>();
  for (const page of pages) {
    for (const block of page.blocks) {
      if (block.type === "booking") {
        for (const it of block.items ?? []) {
          if (it.title) services.set(it.title, priceToPaise(it.heading));
        }
      } else if (block.type === "menu") {
        for (const it of block.items ?? []) {
          if (it.title) products.set(it.title, priceToPaise(it.heading));
        }
      }
    }
  }
  return { services, products };
}

export interface CreateBookingInput {
  service: string;
  amountPaise: number;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  leadId?: string | null;
}

export async function createBooking(input: CreateBookingInput): Promise<WebsiteBooking> {
  const repo = await getWebsiteBookingRepository();
  return repo.insertOne(
    {
      service: input.service,
      amountPaise: input.amountPaise,
      date: input.date,
      time: input.time,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      notes: input.notes,
      status: input.amountPaise > 0 ? "pending" : "confirmed",
      payment: input.amountPaise > 0 ? "pending" : "none",
      leadId: input.leadId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<WebsiteBooking, "_id" | "tenantId">,
    { action: "website_booking.created" },
  );
}

export async function listBookings(): Promise<WebsiteBooking[]> {
  return (await getWebsiteBookingRepository()).list();
}
export async function setBookingStatus(id: string, status: FulfilmentStatus): Promise<void> {
  await (await getWebsiteBookingRepository()).setStatus(id, status);
}
export async function markBookingPaid(razorpayOrderId: string, razorpayPaymentId: string): Promise<void> {
  await (await getWebsiteBookingRepository()).markPaid(razorpayOrderId, razorpayPaymentId);
}
export async function attachBookingRazorpayOrder(id: string, razorpayOrderId: string): Promise<void> {
  await (await getWebsiteBookingRepository()).setRazorpayOrder(id, razorpayOrderId);
}

export interface CreateOrderInput {
  lines: WebsiteOrderLine[];
  amountPaise: number;
  fulfilment: WebsiteOrder["fulfilment"];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  notes?: string;
  leadId?: string | null;
}

export async function createWebsiteOrder(input: CreateOrderInput): Promise<WebsiteOrder> {
  const repo = await getWebsiteOrderRepository();
  return repo.insertOne(
    {
      lines: input.lines,
      amountPaise: input.amountPaise,
      fulfilment: input.fulfilment,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      address: input.address,
      notes: input.notes,
      status: input.amountPaise > 0 ? "pending" : "confirmed",
      payment: input.amountPaise > 0 ? "pending" : "none",
      leadId: input.leadId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<WebsiteOrder, "_id" | "tenantId">,
    { action: "website_order.created" },
  );
}

export async function listWebsiteOrders(): Promise<WebsiteOrder[]> {
  return (await getWebsiteOrderRepository()).list();
}
export async function setOrderStatus(id: string, status: FulfilmentStatus): Promise<void> {
  await (await getWebsiteOrderRepository()).setStatus(id, status);
}
export async function markWebsiteOrderPaid(razorpayOrderId: string, razorpayPaymentId: string): Promise<void> {
  await (await getWebsiteOrderRepository()).markPaid(razorpayOrderId, razorpayPaymentId);
}
export async function attachWebsiteOrderRazorpayOrder(id: string, razorpayOrderId: string): Promise<void> {
  await (await getWebsiteOrderRepository()).setRazorpayOrder(id, razorpayOrderId);
}

/* ------------------------------- helpers -------------------------------- */

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
