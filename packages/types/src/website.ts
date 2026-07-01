/* ------------------------------- Website -------------------------------- */

export type SiteBlockType =
  | "navbar"
  | "hero"
  | "heading"
  | "text"
  | "image"
  | "features"
  | "gallery"
  | "stats"
  | "testimonials"
  | "pricing"
  | "booking"
  | "menu"
  | "cta"
  | "form"
  | "footer";

export type SiteBlockAlign = "left" | "center" | "right";

/**
 * A repeatable child of a block — the unit rendered in a grid/list by
 * multi-item blocks (features, gallery, stats, testimonials, pricing, navbar
 * links, footer links). Fields are optional; each block type reads the ones
 * relevant to it (e.g. `features` uses icon/title/text; `pricing` uses
 * title/heading(price)/text; `gallery` uses imageUrl; `navbar`/`footer` links
 * use text/href).
 */
export interface SiteBlockItem {
  id: string;
  title?: string;
  text?: string;
  heading?: string; // e.g. a price on a pricing card, or an author role
  imageUrl?: string;
  icon?: string; // emoji shown on feature cards
  href?: string; // for link items (navbar / footer)
}

/** A single content block on a page. Fields are optional per type; the editor
 * and renderer only read the ones relevant to `type`. */
export interface SiteBlock {
  id: string;
  type: SiteBlockType;
  text?: string; // heading/text/hero subtitle, section subtitle
  heading?: string; // hero/cta/section title, navbar brand, footer brand
  imageUrl?: string; // image/hero background
  buttonLabel?: string; // cta/hero/navbar
  buttonHref?: string; // cta/hero/navbar
  formId?: string; // form block → embedded SiteForm
  bgColor?: string; // section background color override (hex)
  align?: SiteBlockAlign; // content alignment
  items?: SiteBlockItem[]; // features/gallery/stats/testimonials/pricing/nav/footer
}

export type PageStatus = "draft" | "published";

export interface SitePage {
  _id: string;
  tenantId: string;
  slug: string; // url segment, e.g. "about"; the home page also has isHome=true
  title: string;
  blocks: SiteBlock[];
  status: PageStatus;
  isHome: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FormFieldType = "text" | "email" | "phone" | "textarea";

export interface SiteFormField {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
}

export interface SiteForm {
  _id: string;
  tenantId: string;
  name: string;
  fields: SiteFormField[];
  submitText: string;
  /** When true, each submission also creates a CRM lead (the unified-data-model loop). */
  createsLead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormSubmission {
  _id: string;
  tenantId: string;
  formId: string;
  data: Record<string, string>;
  leadId?: string | null;
  createdAt: Date;
}

/* ---------------------- Dynamic website transactions --------------------- */

/** Lifecycle of a booking or order a website visitor places. */
export type FulfilmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

/** Payment state for a website transaction. "none" = the item was free. */
export type PaymentState = "none" | "pending" | "paid" | "failed";

/** An appointment/reservation a visitor books from a `booking` block. */
export interface WebsiteBooking {
  _id: string;
  tenantId: string;
  service: string;
  amountPaise: number; // 0 when the service is free
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  status: FulfilmentStatus;
  payment: PaymentState;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  leadId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A single line on a website order (one menu/product item × quantity). */
export interface WebsiteOrderLine {
  title: string;
  unitPaise: number;
  qty: number;
}

/** An order a visitor places from a `menu` block. */
export interface WebsiteOrder {
  _id: string;
  tenantId: string;
  lines: WebsiteOrderLine[];
  amountPaise: number;
  fulfilment: "pickup" | "delivery" | "dine-in";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  notes?: string;
  status: FulfilmentStatus;
  payment: PaymentState;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  leadId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
