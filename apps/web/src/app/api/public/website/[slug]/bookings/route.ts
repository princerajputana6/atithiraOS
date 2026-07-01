import { NextResponse } from "next/server";
import { getOrganizationRepository } from "@atithira/core-tenancy";
import {
  getPublicCatalog,
  createBooking,
  attachBookingRazorpayOrder,
} from "@atithira/module-website";
import { createLead } from "@atithira/module-crm";
import { runWithTenantContext } from "@atithira/db";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { startTenantPayment } from "@/lib/public-payments";

/**
 * Public, unauthenticated booking endpoint for a tenant's hosted site. Prices
 * are resolved server-side from the published `booking` blocks (never trusted
 * from the client), a CRM lead is created (unified-data-model loop), and — when
 * the service is priced and the tenant has a payment gateway connected — a
 * Razorpay order is opened on the tenant's own account for online payment.
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
    service?: string;
    date?: string;
    time?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    notes?: string;
  };

  const service = String(body.service ?? "").trim();
  const customerName = String(body.customerName ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();
  if (!service || !customerName || !customerPhone || !date || !time) {
    return NextResponse.json(
      { error: "service, date, time, name, and phone are required" },
      { status: 400 },
    );
  }

  try {
    const result = await runWithTenantContext(
      { tenantId: org._id, userId: null },
      async () => {
        const { services } = await getPublicCatalog();
        if (!services.has(service)) throw new Error("Unknown service");
        const amountPaise = services.get(service) ?? 0;

        const lead = await createLead({
          name: customerName,
          email: body.customerEmail,
          source: `website:booking:${service}`,
        });

        const booking = await createBooking({
          service,
          amountPaise,
          date,
          time,
          customerName,
          customerPhone,
          customerEmail: body.customerEmail,
          notes: body.notes,
          leadId: String(lead._id),
        });

        const payment = await startTenantPayment({
          amountPaise,
          receipt: `bk_${booking._id}`,
          notes: { kind: "booking", bookingId: String(booking._id), tenantId: org._id },
        });
        if (payment) await attachBookingRazorpayOrder(String(booking._id), payment.orderId);

        return { bookingId: String(booking._id), amountPaise, payment };
      },
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
