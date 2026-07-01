import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type {
  SitePage,
  SiteForm,
  FormSubmission,
  PageStatus,
  WebsiteBooking,
  WebsiteOrder,
  FulfilmentStatus,
} from "@atithira/types";

export class SitePageRepository extends TenantScopedRepository<SitePage> {
  protected readonly targetType = "site_page";
  constructor(collection: Collection<SitePage>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  findBySlug(slug: string) {
    return this.findOne({ slug } as Filter<SitePage>);
  }
  findHome() {
    return this.findOne({ isHome: true } as Filter<SitePage>);
  }
  update(id: string, patch: Partial<Omit<SitePage, "_id" | "tenantId">>) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { ...patch, updatedAt: new Date() } },
      { action: "site_page.update" },
    );
  }
  setStatus(id: string, status: PageStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `site_page.${status}` },
    );
  }
  /** Clears isHome on every page for this tenant, so a new home is exclusive. */
  async clearHome() {
    const tenantId = this.requireTenantId();
    await this.collection.updateMany(
      { tenantId, isHome: true } as Filter<SitePage>,
      { $set: { isHome: false } },
    );
  }
  remove(id: string) {
    return this.deleteOne({ _id: new ObjectId(id) } as never, {
      action: "site_page.delete",
    });
  }
}

export class SiteFormRepository extends TenantScopedRepository<SiteForm> {
  protected readonly targetType = "site_form";
  constructor(collection: Collection<SiteForm>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  update(id: string, patch: Partial<Omit<SiteForm, "_id" | "tenantId">>) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { ...patch, updatedAt: new Date() } },
      { action: "site_form.update" },
    );
  }
}

export class FormSubmissionRepository extends TenantScopedRepository<FormSubmission> {
  protected readonly targetType = "form_submission";
  constructor(collection: Collection<FormSubmission>) {
    super(collection);
  }
  listForForm(formId: string) {
    return this.find({ formId } as Filter<FormSubmission>);
  }
  list() {
    return this.find({});
  }
}

export class WebsiteBookingRepository extends TenantScopedRepository<WebsiteBooking> {
  protected readonly targetType = "website_booking";
  constructor(collection: Collection<WebsiteBooking>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  setStatus(id: string, status: FulfilmentStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `website_booking.${status}` },
    );
  }
  setRazorpayOrder(id: string, razorpayOrderId: string) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { razorpayOrderId, updatedAt: new Date() } },
      { action: "website_booking.payment_started" },
    );
  }
  async markPaid(razorpayOrderId: string, razorpayPaymentId: string) {
    const tenantId = this.requireTenantId();
    await this.collection.updateOne(
      { tenantId, razorpayOrderId } as Filter<WebsiteBooking>,
      { $set: { payment: "paid", status: "confirmed", razorpayPaymentId, updatedAt: new Date() } },
    );
  }
}

export class WebsiteOrderRepository extends TenantScopedRepository<WebsiteOrder> {
  protected readonly targetType = "website_order";
  constructor(collection: Collection<WebsiteOrder>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  setStatus(id: string, status: FulfilmentStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `website_order.${status}` },
    );
  }
  setRazorpayOrder(id: string, razorpayOrderId: string) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { razorpayOrderId, updatedAt: new Date() } },
      { action: "website_order.payment_started" },
    );
  }
  async markPaid(razorpayOrderId: string, razorpayPaymentId: string) {
    const tenantId = this.requireTenantId();
    await this.collection.updateOne(
      { tenantId, razorpayOrderId } as Filter<WebsiteOrder>,
      { $set: { payment: "paid", status: "confirmed", razorpayPaymentId, updatedAt: new Date() } },
    );
  }
}

export async function getSitePageRepository() {
  const db = await getDb();
  return new SitePageRepository(db.collection<SitePage>("website_pages"));
}
export async function getWebsiteBookingRepository() {
  const db = await getDb();
  return new WebsiteBookingRepository(db.collection<WebsiteBooking>("website_bookings"));
}
export async function getWebsiteOrderRepository() {
  const db = await getDb();
  return new WebsiteOrderRepository(db.collection<WebsiteOrder>("website_orders"));
}
export async function getSiteFormRepository() {
  const db = await getDb();
  return new SiteFormRepository(db.collection<SiteForm>("website_forms"));
}
export async function getFormSubmissionRepository() {
  const db = await getDb();
  return new FormSubmissionRepository(
    db.collection<FormSubmission>("website_submissions"),
  );
}
