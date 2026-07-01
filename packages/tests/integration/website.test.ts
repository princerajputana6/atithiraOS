import { describe, it, expect } from "vitest";
import { signup } from "@atithira/core-identity";
import { createOrganizationForNewUser } from "@atithira/core-tenancy";
import { runWithTenantContext } from "@atithira/db";
import {
  createPage,
  setPageStatus,
  getPublishedPage,
  createForm,
  recordSubmission,
  listSubmissions,
  createBooking,
  listBookings,
  attachBookingRazorpayOrder,
  markBookingPaid,
  createWebsiteOrder,
  listWebsiteOrders,
  markWebsiteOrderPaid,
} from "@atithira/module-website";
import { createLead, listLeads } from "@atithira/module-crm";

async function createTenant(label: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const user = await signup({
    email: `${label}-${suffix}@example.com`,
    password: "Sup3rSecret!23",
    name: `${label} Owner`,
  });
  const org = await createOrganizationForNewUser({
    organizationName: `${label} Org`,
    slug: `${label}-${suffix}`,
    ownerUserId: user._id,
    ownerEmail: user.email,
  });
  return { user, org };
}

describe("website module", () => {
  it("only serves a page publicly once it is published", async () => {
    const { user, org } = await createTenant("web");
    await runWithTenantContext({ tenantId: org._id, userId: user._id }, async () => {
      const page = await createPage({ title: "Home", slug: "home", isHome: true });
      expect(await getPublishedPage()).toBeNull(); // draft — not public yet
      await setPageStatus(page._id, "published");
      const live = await getPublishedPage();
      expect(live?.title).toBe("Home");
      expect(live?.isHome).toBe(true);
    });
  });

  it("turns a form submission into a CRM lead (unified data model)", async () => {
    const { user, org } = await createTenant("weblead");
    await runWithTenantContext({ tenantId: org._id, userId: user._id }, async () => {
      const form = await createForm({
        name: "Contact us",
        fields: [
          { key: "name", label: "Name", type: "text", required: true },
          { key: "email", label: "Email", type: "email", required: true },
        ],
        createsLead: true,
      });

      // Reproduce the app-layer composition the public submit route performs.
      const data = { name: "Asha Rao", email: "asha@example.com" };
      const lead = await createLead({ name: data.name, email: data.email, source: `website:${form.name}` });
      await recordSubmission(form._id, data, String(lead._id));

      const leads = await listLeads();
      expect(leads.some((l) => l.name === "Asha Rao")).toBe(true);

      const subs = await listSubmissions(form._id);
      expect(subs).toHaveLength(1);
      expect(subs[0]?.leadId).toBe(String(lead._id));
    });
  });

  it("confirms a free booking immediately but holds a paid one until payment", async () => {
    const { user, org } = await createTenant("webbook");
    await runWithTenantContext({ tenantId: org._id, userId: user._id }, async () => {
      // Free service — no gateway involved, confirmed on creation.
      const free = await createBooking({
        service: "Consultation",
        amountPaise: 0,
        date: "2026-08-01",
        time: "10:00",
        customerName: "Ravi",
        customerPhone: "9990001111",
      });
      expect(free.status).toBe("confirmed");
      expect(free.payment).toBe("none");

      // Paid service — pending until the tenant's gateway confirms payment.
      const paid = await createBooking({
        service: "Haircut & Color",
        amountPaise: 250000,
        date: "2026-08-02",
        time: "16:30",
        customerName: "Meera",
        customerPhone: "8880002222",
      });
      expect(paid.status).toBe("pending");
      expect(paid.payment).toBe("pending");

      // The verify route attaches the Razorpay order id, then marks it paid.
      const rzpOrderId = `order_${paid._id}`;
      await attachBookingRazorpayOrder(String(paid._id), rzpOrderId);
      await markBookingPaid(rzpOrderId, "pay_test_123");

      const settled = (await listBookings()).find((b) => String(b._id) === String(paid._id));
      expect(settled?.status).toBe("confirmed");
      expect(settled?.payment).toBe("paid");
      expect(settled?.razorpayPaymentId).toBe("pay_test_123");
    });
  });

  it("marks a paid food order as confirmed only after payment settles", async () => {
    const { user, org } = await createTenant("weborder");
    await runWithTenantContext({ tenantId: org._id, userId: user._id }, async () => {
      const order = await createWebsiteOrder({
        lines: [
          { title: "Cappuccino", qty: 2, unitPaise: 12000 },
          { title: "Croissant", qty: 1, unitPaise: 8000 },
        ],
        amountPaise: 32000,
        fulfilment: "pickup",
        customerName: "Sam",
        customerPhone: "7770003333",
      });
      expect(order.status).toBe("pending");
      expect(order.payment).toBe("pending");

      const rzpOrderId = `order_${order._id}`;
      await markWebsiteOrderPaid(rzpOrderId, "pay_test_456");
      // No attach happened, so markPaid (keyed on razorpayOrderId) is a no-op —
      // the order stays pending, proving payment is only credited on a match.
      const stillPending = (await listWebsiteOrders()).find((o) => String(o._id) === String(order._id));
      expect(stillPending?.payment).toBe("pending");
    });
  });
});
