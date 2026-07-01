import { NextResponse } from "next/server";
import { getOrganizationRepository } from "@atithira/core-tenancy";
import {
  getPublicCatalog,
  createWebsiteOrder,
  attachWebsiteOrderRazorpayOrder,
} from "@atithira/module-website";
import { createLead } from "@atithira/module-crm";
import { runWithTenantContext } from "@atithira/db";
import type { WebsiteOrderLine } from "@atithira/types";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { startTenantPayment } from "@/lib/public-payments";

const FULFILMENTS = new Set(["pickup", "delivery", "dine-in"]);

/**
 * Public, unauthenticated order endpoint for a tenant's hosted site. Line
 * prices are resolved server-side from the published `menu` blocks (never
 * trusted from the client); the order total is recomputed here. Creates a CRM
 * lead and opens a Razorpay order on the tenant's account when a gateway is
 * connected.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await ensureBootstrapped();
  const { slug } = await params;

  const org = await (await getOrganizationRepository()).findBySlug(slug);
  if (!org) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as {
    items?: { title?: string; qty?: number }[];
    fulfilment?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    address?: string;
    notes?: string;
  };

  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const fulfilment = FULFILMENTS.has(String(body.fulfilment))
    ? (body.fulfilment as "pickup" | "delivery" | "dine-in")
    : "pickup";
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (!customerName || !customerPhone || rawItems.length === 0) {
    return NextResponse.json(
      { error: "name, phone, and at least one item are required" },
      { status: 400 },
    );
  }

  try {
    const result = await runWithTenantContext(
      { tenantId: org._id, userId: null },
      async () => {
        const { products } = await getPublicCatalog();
        const lines: WebsiteOrderLine[] = [];
        for (const raw of rawItems) {
          const title = String(raw.title ?? "").trim();
          const qty = Math.max(1, Math.min(99, Math.floor(Number(raw.qty) || 1)));
          if (!title || !products.has(title)) continue;
          lines.push({ title, unitPaise: products.get(title) ?? 0, qty });
        }
        if (lines.length === 0) throw new Error("No valid items in the order");
        const amountPaise = lines.reduce((sum, l) => sum + l.unitPaise * l.qty, 0);

        const lead = await createLead({
          name: customerName,
          email: body.customerEmail,
          source: "website:order",
        });

        const order = await createWebsiteOrder({
          lines,
          amountPaise,
          fulfilment,
          customerName,
          customerPhone,
          customerEmail: body.customerEmail,
          address: body.address,
          notes: body.notes,
          leadId: String(lead._id),
        });

        const payment = await startTenantPayment({
          amountPaise,
          receipt: `od_${order._id}`,
          notes: { kind: "order", orderId: String(order._id), tenantId: org._id },
        });
        if (payment) await attachWebsiteOrderRazorpayOrder(String(order._id), payment.orderId);

        return { orderId: String(order._id), amountPaise, payment };
      },
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
